import {registry} from "@jahia/ui-extender";
import i18n from "i18next";
import {LanguageSettings} from "./LanguageSettings/LanguageSettings";

export default () => {
    registry.add('callback', 'site-settings-languages', {
        targets: ['jahiaApp-init:100'],
        callback: async () => {
            await i18n.loadNamespaces('site-settings-languages');

            registry.add('adminRoute', 'site-settings-languages', {
                targets: ['administration-sites:41'],
                label: 'site-settings-languages:label.settings.title',
                isSelectable: true,
                requiredPermission: 'siteAdminLanguages',
                render: () => <LanguageSettings/>
            });
        }
    });
};
