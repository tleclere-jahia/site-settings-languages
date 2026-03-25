import {useMemo, useState} from "react";
import {shallowEqual, useSelector} from "react-redux";
import {useTranslation} from "react-i18next";
import {useQuery} from "@apollo/client";
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
                    languages {
                        displayName(language: $displayLanguage)
                        language
                        mandatory
                        activeInEdit
                        activeInLive
                    }
                    mixLanguage: property(name: "j:mixLanguage") { booleanValue }
                    allowsUnlistedLanguages: property(name: "j:allowsUnlistedLanguages") { booleanValue }
                    siteLocales(language: $displayLanguage) {
                        language
                        count
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

    const save = () => console.log('save');

    const [languages, setLanguages] = useState([]);

    useMemo(() => setLanguages(data?.jcr?.result?.site?.languages || []), [data]);
    const availableLocales = data?.admin?.availableLocales.map(l => {
        return {
            iconEnd: <Pill label={l.language.toUpperCase()}/>,
            id: l.language,
            label: l.displayName,
            value: l.language,
            isDisabled: languages.find(lang => lang.language === l.language)
        }
    }) || [];

    const onLanguageChange = (e, item) => setLanguages([...languages, {
        language: item.value,
        displayName: item.label
    }]);

    return <LayoutContent isLoading={loading}
                          aria-labelledby="site-settings-languages-title"
                          header={<Header mainActions={[
                              <Dropdown data={availableLocales} onChange={onLanguageChange} isLoading={loading}
                                        placeholder={t('label.placeholder')}/>,
                              <Button color="accent" size="big" onClick={save}
                                      data-sel-role="save-site-settings-languages"
                                      label={t('label.settings.save')}/>
                          ]} title={`${t('label.settings.title')} - ${data?.jcr?.result?.site?.displayName}`}/>}
                          content={<Content uilang={uilang} site={data?.jcr?.result?.site} languages={languages}
                                            setLanguages={setLanguages}/>}
    />;
};
