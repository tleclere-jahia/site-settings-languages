import {useMemo, useState} from "react";
import {shallowEqual, useSelector} from "react-redux";
import {useTranslation} from "react-i18next";
import {useMutation, useQuery} from "@apollo/client";
import gql from 'graphql-tag';
import {Button, Dropdown, Header, LayoutContent, Pill} from "@jahia/moonstone"
import {PredefinedFragments} from "@jahia/data-helper";
import {Content} from "./Content";

export const LanguageSettings = () => {
    const {t} = useTranslation('site-settings-languages');
    const {site, uilang} = useSelector(state => ({site: state.site, uilang: state.uilang}), shallowEqual);

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

    const [saveSiteSettingsLanguages] = useMutation(gql`mutation siteLanguages($path: String!, $defaultLanguage: String!, $languages: [String!]!, $mandatoryLanguages: [String!]!, $inactiveLanguages: [String!]!, $inactiveLiveLanguages: [String!]!, $mixLanguage: String!, $allowsUnlistedLanguages: String!) {
          jcr(workspace: EDIT) {
            mutateNode(pathOrId: $path) {
              defaultLanguage: mutateProperty(name: "j:defaultLanguage") {
                setValue(value: $defaultLanguage, type: STRING)
              }
              languages: mutateProperty(name: "j:languages") {
                setValues(values: $languages, type: STRING)
              }
              mandatoryLanguages: mutateProperty(name: "j:mandatoryLanguages") {
                setValues(values: $mandatoryLanguages, type: STRING)
              }
              inactiveLanguages: mutateProperty(name: "j:inactiveLanguages") {
                setValues(values: $inactiveLanguages, type: STRING)
              }
              inactiveLiveLanguages: mutateProperty(name: "j:inactiveLiveLanguages") {
                setValues(values: $inactiveLiveLanguages, type: STRING)
              }
              mixLanguage: mutateProperty(name: "j:mixLanguage") {
                setValue(value: $mixLanguage, type: BOOLEAN)
              }
              allowsUnlistedLanguages: mutateProperty(name: "j:allowsUnlistedLanguages") {
                setValue(value: $allowsUnlistedLanguages, type: BOOLEAN)
              }
            }
          }
        }`, {
        variables: {
            path: `/sites/${site}`,
            defaultLanguage,
            languages: siteLocales.map(l => l.language),
            mandatoryLanguages: siteLocales.filter(l => l.mandatory).map(l => l.language),
            inactiveLanguages: siteLocales.filter(l => !l.activeInEdit).map(l => l.language),
            inactiveLiveLanguages: siteLocales.filter(l => !l.activeInLive).map(l => l.language),
            mixLanguage,
            allowsUnlistedLanguages
        }
    });

    const availableLocales = data?.admin?.availableLocales.map(l => {
        return {
            iconEnd: <Pill label={l.language.toUpperCase()}/>,
            id: l.language,
            label: l.displayName,
            value: l.language,
            isDisabled: siteLocales.find(lang => lang.language === l.language)
        }
    }) || [];

    const onLanguageChange = (e, item) => setSiteLocales([...siteLocales, {
        language: item.value,
        displayName: item.label
    }]);

    const save = () => saveSiteSettingsLanguages().then(() => window.location.reload());

    return <LayoutContent isLoading={loading}
                          aria-labelledby="site-settings-languages-title"
                          header={<Header mainActions={[
                              <Dropdown data={availableLocales} onChange={onLanguageChange} isLoading={loading}
                                        className={"site-settings-languages-dropdown"} placeholder={t('label.placeholder')}/>,
                              <Button color="accent" size="big" onClick={save}
                                      data-sel-role="save-site-settings-languages"
                                      label={t('label.settings.save')}/>
                          ]} title={`${t('label.settings.title')} - ${data?.jcr?.result?.site?.displayName}`}/>}
                          content={<Content uilang={uilang} site={data?.jcr?.result?.site}
                                            siteLocales={siteLocales} setSiteLocales={setSiteLocales}
                                            defaultLanguage={defaultLanguage} setDefaultLanguage={setDefaultLanguage}
                                            mixLanguage={mixLanguage} setMixLanguage={setMixLanguage}
                                            allowsUnlistedLanguages={allowsUnlistedLanguages}
                                            setAllowsUnlistedLanguages={setAllowsUnlistedLanguages}/>}
    />;
};
