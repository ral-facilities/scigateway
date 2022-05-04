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

  it('page refresh should open the navigation drawer', () => {
    cy.visit('/');
    cy.clearLocalStorage();
    cy.login('username', 'password');
    cy.reload();
    cy.get('button[aria-label="Close navigation menu"]').should('exist');
  });

  it('should keep drawer in same state when redirecting', () => {
    cy.visit('/login');
    cy.contains('Sign in').should('be.visible');

    cy.contains('Username*').parent().find('input').type('username');
    cy.contains('Password*').parent().find('input').type('password');

    cy.contains('Username*')
      .parent()
      .parent()
      .contains('button', 'Sign in')
      .click();

    cy.url().should('eq', 'http://127.0.0.1:3000/');

    cy.get('button[aria-label="Open navigation menu"]').should('exist');
    cy.get('button[aria-label="Help page"]').click();
    cy.get('button[aria-label="Open navigation menu"]').should('exist');
    cy.get('button[aria-label="Open navigation menu"]').click();
    cy.get('button[aria-label="Close navigation menu"]').should('exist');
    cy.get('button[aria-label="Home page"]').click();
    cy.get('button[aria-label="Close navigation menu"]').should('exist');
  });
});
