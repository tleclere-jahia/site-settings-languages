import {useTranslation} from "react-i18next";
import {useMutation} from "@apollo/client";
import gql from "graphql-tag";
import {Button, Header} from "@jahia/moonstone";

export default ({site, siteLocales, defaultLanguage, mixLanguage, allowsUnlistedLanguages}) => {
    const {t} = useTranslation('site-settings-languages');

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
            path: `/sites/${site.siteKey}`,
            defaultLanguage,
            languages: siteLocales.filter(l => l.activeInEdit || l.activeInLive || l.defaultLanguage || l.mandatory).map(l => l.language),
            mandatoryLanguages: siteLocales.filter(l => l.mandatory).map(l => l.language),
            inactiveLanguages: siteLocales.filter(l => !l.activeInEdit).map(l => l.language),
            inactiveLiveLanguages: siteLocales.filter(l => !l.activeInLive).map(l => l.language),
            mixLanguage,
            allowsUnlistedLanguages
        }
    });

    return <Header mainActions={[
        <Button color={"accent"} size="big" label={t('label.settings.save')}
                onClick={() => saveSiteSettingsLanguages().then(() => window.location.reload())}
                data-sel-role="save-site-settings-languages"/>
    ]} title={t('label.settings.header', {siteName: site.displayName})}/>;
};
