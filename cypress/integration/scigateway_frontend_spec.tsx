describe('Scigateway', () => {
  it('should load correctly', () => {
    cy.visit('/');
    cy.title().should('equal', 'SciGateway');

    // the parent app should have loaded
    cy.get('[alt="SciGateway"]').should('be.visible');
  });

  it('should load plugin correctly', () => {
    cy.login('username', 'password');

    cy.visit('/plugin1');

    // the plugin should have loaded
    cy.get('#demo_plugin').contains('Demo Plugin').should('be.visible');

    // the plugin should be able to rerender when the sidebar is closed
    cy.get('[aria-label="Close navigation menu"]').click();
    cy.get('#demo_plugin').contains('Demo Plugin').should('be.visible');

    // plugin link should be visible in sidebar
    cy.get('a[href="/plugin1"]').should('be.visible');
  });

  it('should load 404 page correctly', () => {
    cy.login('username', 'password');

    cy.visit('/incorrect_url');

    cy.contains('404').should('be.visible');
  });
});
