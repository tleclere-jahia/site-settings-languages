import {useState} from "react";
import {useTranslation} from "react-i18next";
import {
    Add,
    Button,
    Check,
    Menu,
    MenuItem,
    MoreVert,
    Paper,
    Pill,
    Table,
    TableBody,
    TableBodyCell,
    TableHead,
    TableHeadCell,
    TableRow
} from "@jahia/moonstone";
import LanguageModal from "./LanguageModal";
import "./LanguageSettings.scss";

export default ({uilang, defaultLanguage, setDefaultLanguage, siteLocales, setSiteLocales, availableLocales}) => {
    const {t} = useTranslation('site-settings-languages');

    const [language, setLanguage] = useState(null);
    const [languageModalOpen, setLanguageModalOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState({});
    const [anchorEl, setAnchorEl] = useState({});
    const closeMenu = language => {
        setMenuOpen(Object.assign({}, menuOpen, {[language]: false}));
        setAnchorEl(Object.assign({}, anchorEl, {[language]: null}));
    };
    const openMenu = (e, language) => {
        setMenuOpen(Object.assign({}, menuOpen, {[language]: !menuOpen[language]}));
        setAnchorEl(Object.assign({}, anchorEl, {[language]: e.currentTarget}));
    };

    const openModal = language => {
        if (language) closeMenu(language.language);
        setLanguage(language);
        setLanguageModalOpen(true);
    };
    const closeModal = (l, addLanguage) => {
        setLanguageModalOpen(false);
        if (addLanguage) setSiteLocales([...siteLocales, l]);
        else setSiteLocales(siteLocales.map(lang => lang.language === l.language ? l : lang));
    };

    const getLanguageCount = l => siteLocales.find(lang => lang.language === l.language)?.count || 0;

    const columnsWidth = {
        default: '5%',
        languages: '35%',
        visibility: '45%'
    };

    return <>
        <LanguageModal language={language}
                       isOpen={languageModalOpen} closeModal={closeModal}
                       siteLocales={siteLocales} availableLocales={availableLocales}/>
        <Paper>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableHeadCell width={columnsWidth.default}>{t('label.table.th.default')}</TableHeadCell>
                        <TableHeadCell width={columnsWidth.languages}>{t('label.table.th.languages')}</TableHeadCell>
                        <TableHeadCell width={columnsWidth.visibility}>{t('label.table.th.visibility')}</TableHeadCell>
                        <TableHeadCell/>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {siteLocales
                        .sort((a, b) => a.displayName.localeCompare(b.displayName))
                        .map(l => <TableRow onClick={e => e.stopPropagation()} key={l.language}>
                            <TableBodyCell width={columnsWidth.default}>{defaultLanguage === l.language ?
                                <Check color="blue"/> : ''}</TableBodyCell>
                            <TableBodyCell width={columnsWidth.languages}>{l.displayName} <Pill
                                label={l.language}/></TableBodyCell>
                            <TableBodyCell width={columnsWidth.visibility}>{
                                l.activeInEdit && l.activeInLive ? t('label.visibility.active.title') :
                                    l.activeInEdit && !l.activeInLive ? t('label.visibility.hiddenInLive.title') :
                                        l.mandatory ? t('label.visibility.required.title') : t('label.visibility.inactive.title')
                            }</TableBodyCell>
                            <TableBodyCell align={"right"}>
                                <Button size="big" variant="ghost" icon={<MoreVert/>}
                                        onClick={e => openMenu(e, l.language)}/>
                                <Menu isDisplayed={menuOpen[l.language] !== undefined && menuOpen[l.language]}
                                      anchorEl={anchorEl[l.language]}
                                      anchorPosition={{top: 0, left: 0}}
                                      anchorElOrigin={{
                                          vertical: 'bottom',
                                          horizontal: 'left'
                                      }}
                                      transformElOrigin={{
                                          vertical: 'top',
                                          horizontal: 'left'
                                      }}
                                      onClose={() => closeMenu(l.language)}>
                                    <MenuItem label={t('label.table.actions.edit')}
                                              isDisabled={l.language === defaultLanguage}
                                              onClick={() => {
                                                  if (l.language !== defaultLanguage) openModal(l)
                                              }}/>
                                    <MenuItem label={t('label.table.actions.default')}
                                              isDisabled={l.language === defaultLanguage}
                                              onClick={() => {
                                                  if (l.language !== defaultLanguage) {
                                                      setDefaultLanguage(l.language);
                                                      setMenuOpen(false);
                                                  }
                                              }}/>
                                    <MenuItem label={t('label.table.actions.delete')}
                                              isDisabled={l.mandatory || l.activeInEdit || l.language === defaultLanguage || l.language === uilang || getLanguageCount(l) > 0}
                                              onClick={() => {
                                                  if (!l.mandatory && !l.activeInEdit && l.language !== defaultLanguage && l.language !== uilang && getLanguageCount(l) == 0) {
                                                      setSiteLocales(siteLocales.filter(language => language.language !== l.language));
                                                      setMenuOpen(false);
                                                  }
                                              }}/>
                                </Menu>
                            </TableBodyCell>
                        </TableRow>)}
                </TableBody>
            </Table>

            <Button size="big" variant="outlined" color="accent" label={t('label.table.actions.add')} icon={<Add/>}
                    onClick={() => openModal(null)} className="btn-add"/>
        </Paper>
    </>;
};
