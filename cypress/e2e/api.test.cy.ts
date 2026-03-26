import gql from "graphql-tag";

describe('GraphQL API calls', () => {

    before(() => {
        cy.login();
        // check if site-settings-languages module is deployed
        cy.visit('/cms/adminframe/default/en/settings.manageModules.html?redirect=false');
        cy.get('input[type="search"]').type('site-settings-languages');
        cy.get('table tbody tr[data-sel-role="module-row-site-settings-languages"]').should('exist');
    });

    // get systemsite default locales
    it('should get systemsite default locales', () => {
        cy.apollo({
            query: gql`{ jcr(workspace: EDIT) { nodeByPath(path: "/sites/systemsite") { site { siteLocales(language: "en") { language } } } } }`
        }).should(result => {
            const data = result?.data?.jcr?.nodeByPath?.site?.siteLocales
            expect(data).length(6);
            expect(data.map(l => l.language)).to.deep.equal(['en', 'fr', 'de', 'it', 'pt', 'es']);
        });
    });

    // get JVM locales
    it('should get JVM locales', () => {
        cy.apollo({
            query: gql`{ admin { availableLocales(language: "en") { language } } }`
        }).should(result => {
            expect(result?.data?.admin?.availableLocales).length(727);
        });
    });

    after(() => {
        cy.logout();
    });
});
