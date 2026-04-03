import {useState} from "react";
import {Button, Dropdown, Modal, ModalBody, ModalFooter, ModalHeader, Pill, Typography} from "@jahia/moonstone";
import {useTranslation} from "react-i18next";
import "./LanguageSettings.scss";

export default ({language, isOpen, closeModal, siteLocales, availableLocales}) => {
    const {t} = useTranslation('site-settings-languages');

    const [newLanguage, setNewLanguage] = useState({activeInEdit: false, activeInLive: false, mandatory: false});
    if (language && language.language !== newLanguage.language) setNewLanguage(
        Object.assign({}, newLanguage, {
            language: language.language,
            displayName: language.displayName,
            activeInEdit: language.activeInEdit,
            activeInLive: language.activeInLive,
            mandatory: language.mandatory
        })
    );

    const onClose = (l, addLanguage) => {
        setNewLanguage({activeInEdit: false, activeInLive: false, mandatory: false});
        closeModal(l, addLanguage);
    };

    return <Modal isOpen={isOpen}>
        <ModalHeader title={t('label.modal.header')}/>
        <ModalBody>
            <div className="field">
                <Typography variant="subheading">{t('label.modal.language.title')}</Typography>
                <Dropdown className="dropdown" placeholder={t('label.modal.language.placeholder')} variant="outlined"
                          isDisabled={language} value={newLanguage.language}
                          data={availableLocales.map(l => {
                              return {
                                  iconEnd: <Pill label={l.language.toUpperCase()}/>,
                                  id: l.language,
                                  label: l.displayName,
                                  value: l.language,
                                  isDisabled: siteLocales.find(lang => lang.language === l.language)
                              }
                          })}
                          onChange={(e, v) => setNewLanguage({
                              ...newLanguage,
                              language: v.value,
                              displayName: v.label
                          })}/>
            </div>

            <div className="field">
                <Typography variant="subheading">{t('label.modal.visibility.title')}</Typography>
                <Dropdown data={[
                    {
                        label: t('label.visibility.active.title'),
                        description: t('label.visibility.active.description'),
                        value: 'active'
                    },
                    {
                        label: t('label.visibility.hiddenInLive.title'),
                        description: t('label.visibility.hiddenInLive.description'),
                        value: 'hiddenInLive'
                    },
                    {
                        label: t('label.visibility.required.title'),
                        description: t('label.visibility.required.description'),
                        value: 'required'
                    },
                    {
                        label: t('label.visibility.inactive.title'),
                        description: t('label.visibility.inactive.description'),
                        value: 'inactive'
                    }
                ]} placeholder={t('label.modal.visibility.placeholder')} variant="outlined" className="dropdown"
                          value={newLanguage.activeInEdit && newLanguage.activeInLive ? 'active' :
                              newLanguage.activeInEdit && !newLanguage.activeInLive ? 'hiddenInLive' :
                                  newLanguage.mandatory ? 'required' : 'inactive'}
                          onChange={(e, v) => {
                              switch (v.value) {
                                  case 'active':
                                      newLanguage.activeInEdit = true;
                                      newLanguage.activeInLive = true;
                                      newLanguage.mandatory = true;
                                      break;
                                  case 'hiddenInLive':
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
            <Button size="big" variant="ghost" label={t('label.modal.actions.cancel')}
                    onClick={() => onClose(null, false)}/>
            {language ?
                <Button size="big" color="accent" label={t('label.modal.actions.save')}
                        onClick={() => onClose(newLanguage, false)}/> :
                <Button size="big" color="accent" label={t('label.modal.actions.add')}
                        onClick={() => onClose(newLanguage, true)}/>
            }
        </ModalFooter>
    </Modal>;
};
