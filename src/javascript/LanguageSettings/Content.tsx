import {useState} from "react";
import {useTranslation} from "react-i18next";
import {useNodeChecks} from "@jahia/data-helper";
import {
    Button,
    Check,
    Checkbox,
    CheckboxGroup,
    CheckboxItem,
    Delete,
    Paper,
    Pill,
    RadioChecked,
    RadioUnchecked,
    Table,
    TableBody,
    TableBodyCell,
    TableHead,
    TableHeadCell,
    TableRow, Typography,
    Warning
} from "@jahia/moonstone";
import "./Content.scss";

export const Content = ({site, uilang, languages, setLanguages}) => {
    const {t} = useTranslation('site-settings-languages');
    const res = useNodeChecks({path: `/sites/${site.name}`, uilang}, {requiredPermission: 'siteAdminLanguages'});

    const [defaultLanguage, setDefaultLanguage] = useState(site.defaultLanguage);
    const [allowsUnlistedLanguages, setAllowsUnlistedLanguages] = useState(site.allowsUnlistedLanguages.booleanValue);
    const [mixLanguage, setMixLanguage] = useState(site.mixLanguage.booleanValue);

    const getLanguageCount = l => site.siteLocales.find(lang => lang.language === l.language)?.count || 0;

    const setMandatory = l => {
        languages.find(lang => lang.language === l.language).mandatory = !l.mandatory;
        setLanguages([...languages]);
    };
    const setActiveInEdit = l => {
        languages.find(lang => lang.language === l.language).activeInEdit = !l.activeInEdit;
        setLanguages([...languages]);
    };
    const setActiveInLive = l => {
        languages.find(lang => lang.language === l.language).activeInLive = !l.activeInLive;
        setLanguages([...languages]);
    };

    const hasError = l => {
        if (l.language === defaultLanguage || l.language === uilang || !l.activeInEdit || l.mandatory || getLanguageCount(l) > 0) {
            if (l.language == uilang) return t('label.table.errors.current');
            if (l.language == defaultLanguage) return t('label.table.errors.default');
            if (l.activeInEdit) return t('label.table.errors.active');
            if (getLanguageCount(l) > 0) return t('label.table.errors.contents');
        }
        return t('label.table.delete');
    };

    return <Paper>
        <Table>
            <TableHead>
                <TableRow>
                    <TableHeadCell>{t('label.table.th.language')}</TableHeadCell>
                    <TableHeadCell>{t('label.table.th.default')}</TableHeadCell>
                    <TableHeadCell>{t('label.table.th.mandatory')}</TableHeadCell>
                    <TableHeadCell>{t('label.table.th.activeInEdit')}</TableHeadCell>
                    <TableHeadCell>{t('label.table.th.activeInLive')}</TableHeadCell>
                    <TableHeadCell>{t('label.table.th.actions')}</TableHeadCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {res.checksResult && languages
                    .sort((a, b) => a.displayName.localeCompare(b.displayName))
                    .map(l => <TableRow>
                        <TableBodyCell>{l.displayName} <Pill label={l.language}/></TableBodyCell>
                        <TableBodyCell>{defaultLanguage === l.language ?
                            <RadioChecked/> :
                            <RadioUnchecked/>
                        }</TableBodyCell>
                        <TableBodyCell><Checkbox checked={l.mandatory} onClick={() => setMandatory(l)}/></TableBodyCell>
                        <TableBodyCell><Checkbox checked={l.activeInEdit} onClick={() => setActiveInEdit(l)}
                                                 isDisabled={l.language === defaultLanguage || l.language === uilang}/></TableBodyCell>
                        <TableBodyCell><Checkbox checked={l.activeInLive} onClick={() => setActiveInLive(l)}
                                                 isDisabled={l.language === defaultLanguage || !l.activeInEdit}/></TableBodyCell>
                        <TableBodyCell>
                            <Button title={t('label.table.default')} variant="ghost" icon={<Check/>}
                                    onClick={() => setDefaultLanguage(l.language)}/>
                            <Button title={hasError(l)} variant="ghost" color="danger" icon={<Delete/>}
                                    disabled={l.mandatory || l.activeInEdit || l.language === defaultLanguage || l.language === uilang || getLanguageCount(l) > 0}
                                    onClick={() => setLanguages(languages.filter(language => language.language !== l.language))}/>
                        </TableBodyCell>
                    </TableRow>)}
            </TableBody>
        </Table>

        <CheckboxGroup name="default" className="checkboxes">
            <CheckboxItem id="replace" value="replace" label={t('label.settings.replace')}
                          checked={mixLanguage} onChange={() => setMixLanguage(!mixLanguage)}/>
            <CheckboxItem id="unlisted" value="unlisted" label={t('label.settings.unlisted')}
                          checked={allowsUnlistedLanguages}
                          onChange={() => setAllowsUnlistedLanguages(!allowsUnlistedLanguages)}/>
        </CheckboxGroup>
    </Paper>;
};
