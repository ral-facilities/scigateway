describe('DAaaS frontend', () => {
  it('should load correctly', () => {
    cy.visit('/');
    cy.title().should('equal', 'DAaaS');

    // the parent app should have loaded
    cy.contains('Data Analysis as a Service').should('be.visible');
  });

  it('should load plugin correctly', () => {
    cy.login('username', 'password');

    cy.visit('/plugin1');

    // the plugins should have loaded
    cy.get('#demo_plugin').should('be.visible');
  });
});
