import {useMemo, useState} from "react";
import {shallowEqual, useSelector} from "react-redux";
import {useQuery} from "@apollo/client";
import gql from 'graphql-tag';
import {LayoutContent} from "@jahia/moonstone"
import {PredefinedFragments, useNodeChecks} from "@jahia/data-helper";
import Header from "./Header";
import Content from "./Content";
import UntranslatedContent from "./UntranslatedContent";

export const LanguageSettings = () => {
    const {site, uilang} = useSelector(state => ({site: state.site, uilang: state.uilang}), shallowEqual);
    const res = useNodeChecks({path: `/sites/${site}`, uilang}, {requiredPermission: 'siteAdminLanguages'});
    if (!res.checksResult) return '';

    const {data, loading, error} = useQuery(gql`query siteInfo($path: String!, $displayLanguage: String!) {
        jcr(workspace: EDIT) {
            result: nodeByPath(path: $path) {
                site {
                    name
                    displayName(language: $displayLanguage)
                    defaultLanguage                    
                    mixLanguage: property(name: "j:mixLanguage") { booleanValue }
                    allowsUnlistedLanguages: property(name: "j:allowsUnlistedLanguages") { booleanValue }
                    siteLocales(language: $displayLanguage) {
                        language
                        count                        
                        displayName(language: $displayLanguage)
                        mandatory
                        activeInEdit
                        activeInLive
                    }
                    ...NodeCacheRequiredFields
                }
                ...NodeCacheRequiredFields
            }
        }
        admin {
            availableLocales(language: $displayLanguage) {
                displayName(language: $displayLanguage)
                language
            }
        }
    }
    ${PredefinedFragments.nodeCacheRequiredFields.gql}`, {
        variables: {
            path: `/sites/${site}`,
            displayLanguage: uilang
        },
        skip: !site
    });

    if (error) {
        console.error(error);
        throw new Error(error.message);
    }

    const [defaultLanguage, setDefaultLanguage] = useState(null);
    const [allowsUnlistedLanguages, setAllowsUnlistedLanguages] = useState(false);
    const [mixLanguage, setMixLanguage] = useState(false);
    const [siteLocales, setSiteLocales] = useState([]);

    useMemo(() => setDefaultLanguage(data?.jcr?.result?.site?.defaultLanguage), [data]);
    useMemo(() => setAllowsUnlistedLanguages(data?.jcr?.result?.site?.allowsUnlistedLanguages?.booleanValue || false), [data]);
    useMemo(() => setMixLanguage(data?.jcr?.result?.site?.mixLanguage?.booleanValue || false), [data]);
    useMemo(() => setSiteLocales(data?.jcr?.result?.site?.siteLocales || []), [data]);

    const untranslatedValue = (allowsUnlistedLanguages && mixLanguage) ? 'all' :
        (!allowsUnlistedLanguages && mixLanguage) ? 'only' :
            (!allowsUnlistedLanguages && !mixLanguage) ? 'never' : 'never';

    const setUntranslatedValue = value => {
        switch (value) {
            case 'never':
                setAllowsUnlistedLanguages(false);
                setMixLanguage(false);
                break;
            case 'only':
                setAllowsUnlistedLanguages(false);
                setMixLanguage(true);
                break;
            case 'all':
                setAllowsUnlistedLanguages(true);
                setMixLanguage(true);
                break;
        }
    };

    return <LayoutContent isLoading={loading}
                          aria-labelledby="site-settings-languages-title"
                          header={<Header site={{siteKey: site, displayName: data?.jcr?.result?.site?.displayName}}
                                          siteLocales={siteLocales} defaultLanguage={defaultLanguage}
                                          mixLanguage={mixLanguage} allowsUnlistedLanguages={allowsUnlistedLanguages}/>}
                          content={<><Content uilang={uilang} defaultLanguage={defaultLanguage}
                                              setDefaultLanguage={setDefaultLanguage}
                                              siteLocales={siteLocales} setSiteLocales={setSiteLocales}
                                              availableLocales={data?.admin?.availableLocales}/>
                              <UntranslatedContent untranslatedValue={untranslatedValue}
                                                   setUntranslatedValue={setUntranslatedValue}/>
                          </>}
    />;
};
