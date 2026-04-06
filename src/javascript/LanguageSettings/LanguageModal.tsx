import {useState} from "react";
import {useTranslation} from "react-i18next";
import {gql, useMutation} from "@apollo/client";
import {
    Button,
    CheckboxGroup,
    CheckboxItem,
    Dropdown,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Pill,
    Typography
} from "@jahia/moonstone";
import type {Language} from "./Language";
import "./LanguageSettings.scss";

export default ({site, language, isOpen, closeModal, refetch, availableLocales, siteLocales, defaultLanguage}) => {
    const {t} = useTranslation('site-settings-languages');

    const [forceReset, setForceReset] = useState(false);
    const [newLanguage, setNewLanguage] = useState({
        activeInEdit: false,
        activeInLive: false,
        mandatory: false
    } as Language);
    if (forceReset) {
        setNewLanguage(language || {
            activeInEdit: false,
            activeInLive: false,
            mandatory: false
        } as Language);
        setForceReset(false);
    } else if (language && language.language !== newLanguage.language) setNewLanguage(Object.assign({}, newLanguage, language));

    const onClose = () => {
        setForceReset(true);
        closeModal(null, false);
    };

    const [gqlSave] = useMutation(gql`mutation siteLanguages($path: String!, $defaultLanguage: String!, $languages: [String!]!, $mandatoryLanguages: [String!]!, $inactiveLanguages: [String!]!, $inactiveLiveLanguages: [String!]!) {
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
            }
          }
        }`);

    const save = (l: Language, addLanguage: boolean) => {
        if (addLanguage) siteLocales = [...siteLocales, l];
        else siteLocales = siteLocales.map((lang: Language) => lang.language === l.language ? l : lang);

        gqlSave({
            variables: {
                path: `/sites/${site}`,
                defaultLanguage,
                languages: siteLocales.filter((l: Language) => l.activeInEdit || l.activeInLive || l.defaultLanguage || l.mandatory).map((l: Language) => l.language),
                mandatoryLanguages: siteLocales.filter((l: Language) => l.mandatory).map((l: Language) => l.language),
                inactiveLanguages: siteLocales.filter((l: Language) => !l.activeInEdit).map((l: Language) => l.language),
                inactiveLiveLanguages: siteLocales.filter((l: Language) => !l.activeInLive).map((l: Language) => l.language)
            }
        }).then(() => {
            setForceReset(true);
            closeModal(l, addLanguage);
            refetch();
        });
    };

    return <Modal isOpen={isOpen}>
        <ModalHeader
            title={t('label.modal.header', {action: language ? t('label.actions.edit') : t('label.actions.add')})}/>
        <ModalBody>
            <div className="field">
                <Typography variant="subheading">{t('label.modal.language.title')}</Typography>
                <Dropdown className="dropdown" placeholder={t('label.modal.language.placeholder')} variant="outlined"
                          isDisabled={language} value={newLanguage.language}
                          data={availableLocales.map((l: Language) => {
                              return {
                                  iconEnd: <Pill label={l.language.toUpperCase()}/>,
                                  id: l.language,
                                  label: l.displayName,
                                  value: l.language,
                                  isDisabled: siteLocales.find((lang: Language) => lang.language === l.language)
                              }
                          })}
                          onChange={(e, v) => setNewLanguage({
                              ...newLanguage,
                              language: v.value,
                              displayName: v.label
                          } as Language)}/>
            </div>

            <div className="field">
                <CheckboxGroup name="default" isReadOnly={true}>
                    <CheckboxItem id={defaultLanguage} label={t('label.modal.default')}
                                  checked={newLanguage.language === defaultLanguage}/>
                </CheckboxGroup>
            </div>

            <div className="field">
                <Typography variant="subheading">{t('label.modal.availability.title')}</Typography>
                <Dropdown data={[
                    {
                        label: t('label.availability.inactive.title'),
                        description: t('label.availability.inactive.description'),
                        value: 'inactive',
                        isDisabled: newLanguage.language === defaultLanguage
                    },
                    {
                        label: t('label.availability.inactiveInLive.title'),
                        description: t('label.availability.inactiveInLive.description'),
                        value: 'inactiveInLive',
                        isDisabled: newLanguage.language === defaultLanguage
                    },
                    {
                        label: t('label.availability.active.title'),
                        description: t('label.availability.active.description'),
                        value: 'active',
                        isDisabled: newLanguage.language === defaultLanguage
                    },
                    {
                        label: t('label.availability.required.title'),
                        description: t('label.availability.required.description'),
                        value: 'required'
                    }
                ]} placeholder={t('label.modal.availability.placeholder')} variant="outlined" className="dropdown"
                          value={newLanguage.activeInEdit && newLanguage.activeInLive ? 'active' :
                              newLanguage.activeInEdit && !newLanguage.activeInLive ? 'inactiveInLive' :
                                  newLanguage.mandatory ? 'required' : 'inactive'}
                          onChange={(e, v) => {
                              switch (v.value) {
                                  case 'active':
                                      newLanguage.activeInEdit = true;
                                      newLanguage.activeInLive = true;
                                      newLanguage.mandatory = true;
                                      break;
                                  case 'inactiveInLive':
                                      newLanguage.activeInEdit = true;
                                      newLanguage.activeInLive = false;
                                      newLanguage.mandatory = true;
                                      break;
                                  case 'required':
                                      newLanguage.activeInEdit = false;
                                      newLanguage.activeInLive = false;
                                      newLanguage.mandatory = true;
                                      break;
                                  case 'inactive':
                                      newLanguage.activeInEdit = false;
                                      newLanguage.activeInLive = false;
                                      newLanguage.mandatory = false;
                                      break;
                              }
                              setNewLanguage({...newLanguage});
                          }}/>
            </div>
        </ModalBody>
        <ModalFooter>
            <Button size="big" variant="ghost" label={t('label.actions.cancel')}
                    onClick={() => onClose()}/>
            {language ?
                <Button size="big" color="accent" label={t('label.actions.save')}
                        onClick={() => save(newLanguage, false)}/> :
                <Button size="big" color="accent" label={t('label.actions.add')}
                        onClick={() => save(newLanguage, true)}/>
            }
        </ModalFooter>
    </Modal>;
};
