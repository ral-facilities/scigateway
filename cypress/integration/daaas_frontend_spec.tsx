describe('DAaaS frontend', () => {
  it('.should() - load correctly', () => {
    cy.visit('/');
    cy.title().should('equal', 'DAaaS');

    // the parent app should have loaded
    cy.contains('Data Analysis as a Service').should('be.visible');

    // the plugins should have loaded
    cy.contains('Demo Plugin').should('be.visible');
  });
});
