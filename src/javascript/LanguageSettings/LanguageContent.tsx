import React, {MutableRefObject, useState} from "react";
import {useTranslation} from "react-i18next";
import {gql, useMutation} from "@apollo/client";
import {
    Button,
    Delete,
    Edit,
    Menu,
    MenuItem,
    MoreVert,
    Paper,
    Pill,
    Star,
    Table,
    TableBody,
    TableBodyCell,
    TableHead,
    TableHeadCell,
    TableRow
} from "@jahia/moonstone";
import "./LanguageSettings.scss";
import {Language} from "./Language";

export default ({site, uilang, openModal, siteLocales, defaultLanguage, refetch}) => {
    const {t} = useTranslation('site-settings-languages');

    const [menuOpen, setMenuOpen] = useState({} as Record<string, boolean>);
    const [anchorEl, setAnchorEl] = useState({} as Record<string, MutableRefObject<HTMLDivElement>>);
    const closeMenu = (language: string) => {
        setMenuOpen(Object.assign({}, menuOpen, {[language]: false}));
        setAnchorEl(Object.assign({}, anchorEl, {[language]: null}));
    };
    const openMenu = (e: React.MouseEvent, language: string) => {
        setMenuOpen(Object.assign({}, menuOpen, {[language]: !menuOpen[language]}));
        setAnchorEl(Object.assign({}, anchorEl, {[language]: e.currentTarget}));
    };

    const editLanguage = (language: Language) => {
        if (language) closeMenu(language.language);
        openModal(language);
    };

    const getLanguageCount = (l: Language) => siteLocales.find((lang: Language) => lang.language === l.language)?.count || 0;

    const [gqlSetDefaultLanguage] = useMutation(gql`mutation setSiteDefaultLanguage($path: String!, $defaultLanguage: String!) {
                jcr(workspace: EDIT) {
                    mutateNode(pathOrId: $path) {
                        defaultLanguage: mutateProperty(name: "j:defaultLanguage") {
                            setValue(value: $defaultLanguage, type: STRING)
                        }
                    }
                }
            }`);
    const [gqlDeleteLanguage] = useMutation(gql`mutation deleteSiteLanguage($path: String!, $languages: [String!]!, $mandatoryLanguages: [String!]!, $inactiveLanguages: [String!]!, $inactiveLiveLanguages: [String!]!) {
                jcr {
                    mutateNode(pathOrId: $path) {
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
                    }
                }
            }`);

    const setDefaultLanguage = (language: string) => {
        gqlSetDefaultLanguage({
            variables: {
                path: `/sites/${site}`,
                defaultLanguage: language
            }
        }).then(() => {
            closeMenu(language);
            refetch();
        });
    };

    const deleteLanguage = (language: string) => {
        const filteredSiteLocales = siteLocales.filter((l: Language) => l.language !== language);
        gqlDeleteLanguage({
            variables: {
                path: `/sites/${site}`,
                languages: filteredSiteLocales.filter((l: Language) => l.activeInEdit || l.activeInLive || l.defaultLanguage || l.mandatory).map((l: Language) => l.language),
                mandatoryLanguages: filteredSiteLocales.filter((l: Language) => l.mandatory).map((l: Language) => l.language),
                inactiveLanguages: filteredSiteLocales.filter((l: Language) => !l.activeInEdit).map((l: Language) => l.language),
                inactiveLiveLanguages: filteredSiteLocales.filter((l: Language) => !l.activeInLive).map((l: Language) => l.language)
            }
        }).then(() => {
            closeMenu(language);
            refetch();
        });
    };

    const columnsWidth = {
        default: '5%',
        languages: '35%',
        availability: '45%'
    };

    return <Paper>
        <Table>
            <TableHead>
                <TableRow>
                    <TableHeadCell width={columnsWidth.default}>{t('label.table.th.default')}</TableHeadCell>
                    <TableHeadCell width={columnsWidth.languages}>{t('label.table.th.languages')}</TableHeadCell>
                    <TableHeadCell
                        width={columnsWidth.availability}>{t('label.table.th.availability')}</TableHeadCell>
                    <TableHeadCell/>
                </TableRow>
            </TableHead>
            <TableBody>{siteLocales.sort((a: Language, b: Language) => a.displayName.localeCompare(b.displayName))
                .map((l: Language) => {
                    const languageCount = getLanguageCount(l);

                    return <TableRow onClick={e => e.stopPropagation()} key={l.language}>
                        <TableBodyCell width={columnsWidth.default}>{defaultLanguage === l.language ?
                            <Star color="blue"/> : ''}</TableBodyCell>
                        <TableBodyCell width={columnsWidth.languages}>
                            {l.displayName} <Pill label={l.language}/>
                        </TableBodyCell>
                        <TableBodyCell width={columnsWidth.availability}>{
                            l.activeInEdit && l.activeInLive ? t('label.availability.active.title') :
                                l.activeInEdit && !l.activeInLive ? t('label.availability.inactiveInLive.title') :
                                    l.mandatory ? t('label.availability.required.title') : t('label.availability.inactive.title')
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
                                <MenuItem label={t('label.actions.edit')}
                                          iconStart={<Edit/>}
                                          onClick={() => editLanguage(l)}/>
                                <MenuItem label={t('label.table.actions.default.title')}
                                          iconStart={<Star/>}
                                          isDisabled={l.language === defaultLanguage}
                                          onClick={() => {
                                              if (l.language !== defaultLanguage) {
                                                  setDefaultLanguage(l.language);
                                              } else {
                                                  // TODO: Moonstone alert
                                                  alert(t('label.table.actions.default.error'));
                                                  closeMenu(l.language);
                                              }
                                          }}/>
                                <MenuItem label={t('label.table.actions.delete.title')}
                                          iconStart={<Delete/>}
                                          isDisabled={l.mandatory || l.activeInEdit || l.language === defaultLanguage || l.language === uilang || languageCount > 0}
                                          onClick={() => {
                                              if (!l.mandatory && !l.activeInEdit && l.language !== defaultLanguage && l.language !== uilang && languageCount == 0) {
                                                  deleteLanguage(l.language);
                                              } else {
                                                  let errorMessage = `error`;
                                                  if (l.mandatory) errorMessage = t('label.table.actions.delete.error.mandatory');
                                                  if (l.activeInEdit) errorMessage = t('label.table.actions.delete.error.activeInEdit');
                                                  if (languageCount > 0) errorMessage = t('label.table.actions.delete.error.language', {count: languageCount});
                                                  alert(errorMessage);
                                                  closeMenu(l.language);
                                              }
                                          }}/>
                            </Menu>
                        </TableBodyCell>
                    </TableRow>;
                })
            }
            </TableBody>
        </Table>
    </Paper>;
};
