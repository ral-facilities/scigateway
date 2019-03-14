describe('DAaaS frontend', () => {
  it('.should() - load correctly', () => {
    cy.visit('/');
    cy.title().should('equal', 'React App');
  });
});
