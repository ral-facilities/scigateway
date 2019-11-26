describe('Scigateway', () => {
  it('.should() - load correctly', () => {
    cy.visit('/');
    cy.title().should('equal', 'Scigateway');

    // the parent app should have loaded
    cy.contains('SciGateway').should('be.visible');

    // the plugins should have loaded
    cy.get('#demo_plugin').should('be.visible');
  });
});
