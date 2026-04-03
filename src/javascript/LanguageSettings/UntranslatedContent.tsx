import {useTranslation} from "react-i18next";
import {Paper, RadioGroup, RadioItem, Typography} from "@jahia/moonstone";
import "./LanguageSettings.scss";

export default ({untranslatedValue, setUntranslatedValue}) => {
    const {t} = useTranslation('site-settings-languages');

    return <Paper>
        <Typography variant="heading">{t('label.settings.unstranslatedContent.title')}</Typography>
        <RadioGroup className="radio-section" value={untranslatedValue}
                    onChange={(e, v) => setUntranslatedValue(v)}>
            <RadioItem id={"never"} label={t('label.settings.unstranslatedContent.never')} value={"never"}/>
            <RadioItem id={"only"} label={t('label.settings.unstranslatedContent.only')} value={"only"}/>
            <RadioItem id={"all"} label={t('label.settings.unstranslatedContent.all')} value={"all"}/>
        </RadioGroup>
    </Paper>;
};
