describe('Scigateway', () => {
  it('.should() - load correctly', () => {
    cy.visit('/');
    cy.title().should('equal', 'Scigateway');

    // the parent app should have loaded
    cy.contains('Sci Gateway').should('be.visible');

    // the plugins should have loaded
    cy.contains('Demo Plugin').should('be.visible');
  });
});
