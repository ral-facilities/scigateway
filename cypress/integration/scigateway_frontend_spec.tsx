<<<<<<< HEAD:cypress/integration/scigateway_frontend_spec.tsx
describe('Scigateway', () => {
  it('.should() - load correctly', () => {
=======
describe('DAaaS frontend', () => {
  it('should load correctly', () => {
>>>>>>> master:cypress/integration/daaas_frontend.spec.ts
    cy.visit('/');
    cy.title().should('equal', 'Scigateway');

    // the parent app should have loaded
<<<<<<< HEAD:cypress/integration/scigateway_frontend_spec.tsx
    cy.contains('SciGateway').should('be.visible');
=======
    cy.contains('Data Analysis as a Service').should('be.visible');
  });

  it('should load plugin correctly', () => {
    cy.login('username', 'password');

    cy.visit('/plugin1');
>>>>>>> master:cypress/integration/daaas_frontend.spec.ts

    // the plugins should have loaded
    cy.get('#demo_plugin').should('be.visible');
  });
});
