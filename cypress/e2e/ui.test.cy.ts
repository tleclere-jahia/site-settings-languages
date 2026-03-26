import {Dropdown, getComponentByRole, getComponentBySelector} from "@jahia/cypress";

describe('UI Site settings language', () => {
    before(() => {
        cy.login();
        // check if site-settings-languages module is deployed
        cy.visit('/cms/adminframe/default/en/settings.manageModules.html?redirect=false');
        cy.get('input[type="search"]').type('site-settings-languages');
        cy.get('table tbody tr[data-sel-role="module-row-site-settings-languages"]').should('exist');

        // visit site settings languages page
        cy.visit('/jahia/administration/systemsite/site-settings-languages');
    });
    after(() => {
        cy.logout();
    });

    // Dropdown in header: nb items and one item amoung them
    it('should display JVM locales', () => {
        // wait for GraphQL response
        cy.wait(500);
        // open dropdown
        const field = getComponentBySelector(Dropdown, '.site-settings-languages-dropdown');
        field.get().click();
        field.get().find('.moonstone-menuItem').should('have.length', 727)
    });

    // Table: nb elements for one site
    // Table: check default language, which is and it is alone
    // Table: check disabled checkbox, disabled delete button
    // Table: check click delete button: remove item from table
    // Table: check title behind delete button for current displayed language
    // Save: check save button
});
