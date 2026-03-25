import {createSite, deleteSite, enableModule, publishAndWaitJobEnding} from "@jahia/cypress";

describe('My first test', () => {
    const siteKey = 'testsite';
    const langEN = 'en';
    const langFR = 'fr';
    const languages = `${langEN},${langFR}`;
    const siteConfig = {
        languages,
        templateSet: 'basic-templateset',
        serverName: 'jahia-docker',
        locale: langEN
    };

    before(() => {
        createSite(siteKey, siteConfig);
        enableModule('jahia-training-developer', siteKey);
        publishAndWaitJobEnding(`/sites/${siteKey}/home`, [langFR, langEN]);
    });
    after(() => deleteSite(siteKey));

    it('Visit live homepage', () => {
        cy.visit(`/sites/${siteKey}/home.html`);
    });
});
