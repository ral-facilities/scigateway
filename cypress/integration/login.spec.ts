describe('Login', () => {
  beforeEach(() => {
    // localStorage isn't always cleaned up properly between tests
    // see cypress issues #2573, #781, #5876
    cy.visit('/');
    cy.clearLocalStorage();
  });

  it('should load login page when login button clicked', () => {
    cy.visit('/');
    cy.title().should('equal', 'SciGateway');

    cy.contains('Sign in').click();

    cy.url().should('include', '/login');
    cy.contains('Username*').should('be.visible');
    cy.contains('Password*').should('be.visible');
  });

  it('should redirect to login page when given any other url', () => {
    cy.visit('/test');

    cy.url().should('include', '/login');
  });

  it('should not allow form submission given invalid credentials', () => {
    cy.visit('/login');

    cy.contains('Username*').parent().find('input').as('usernameInput');

    cy.get('@usernameInput').type('username');

    cy.contains('Username*')
      .parent()
      .parent()
      .contains('button', 'Sign in')
      .as('signInButton');

    cy.get('@signInButton').should('be.disabled');

    cy.get('@usernameInput').clear();

    cy.contains('Password*').parent().find('input').type('password');

    cy.get('@signInButton').should('be.disabled');
  });

  it('should not login given incorrect credentials', () => {
    cy.visit('/login');

    cy.contains('Username*').parent().find('input').type('wrongusername');
    cy.contains('Password*').parent().find('input').type('wrongpassword');

    cy.contains('Username*')
      .parent()
      .parent()
      .contains('button', 'Sign in')
      .click();

    cy.contains('Failed to log in. Invalid username or password.');
  });

  it('should login given correct credentials', () => {
    cy.visit('/login');
    cy.contains('Sign in').should('be.visible');
    cy.get('button[aria-label="Open navigation menu"]').should(
      'not.be.visible'
    );

    cy.contains('Username*').parent().find('input').type('username');
    cy.contains('Password*').parent().find('input').type('password');

    cy.contains('Username*')
      .parent()
      .parent()
      .contains('button', 'Sign in')
      .click();

    cy.url().should('eq', 'http://127.0.0.1:3000/');

    cy.window().then(
      (window) =>
        expect(window.localStorage.getItem('scigateway:token')).not.be.null
    );
    cy.get('button[aria-label="Open navigation menu"]').should('be.visible');
  });

  it('should login given username with leading or trailing whitespace', () => {
    cy.visit('/login');
    cy.contains('Sign in').should('be.visible');
    cy.get('button[aria-label="Open navigation menu"]').should(
      'not.be.visible'
    );

    cy.contains('Username*').parent().find('input').type(' username ');
    cy.contains('Password*').parent().find('input').type('password');

    cy.contains('Username*')
      .parent()
      .parent()
      .contains('button', 'Sign in')
      .click();

    cy.url().should('eq', 'http://127.0.0.1:3000/');

    cy.window().then(
      (window) =>
        expect(window.localStorage.getItem('scigateway:token')).not.be.null
    );
    cy.get('button[aria-label="Open navigation menu"]').should('be.visible');
  });

  it('should logout successfully', () => {
    cy.login('username', 'password');
    cy.visit('/');
    cy.title().should('equal', 'SciGateway');

    cy.get('[aria-label="Open user menu"]').click();

    cy.contains('Sign out').click();

    cy.contains('Sign in').should('be.visible');

    cy.window().then(
      (window) =>
        expect(window.localStorage.getItem('scigateway:token')).be.null
    );
  });

  describe('authenticator selector', () => {
    beforeEach(() => {
      cy.server();
      cy.route('/settings.json', {
        plugins: [],
        'ui-strings': 'res/default.json',
        'auth-provider': 'icat',
        authUrl: 'http://localhost:8000',
        'help-tour-steps': [],
      });
      cy.route('/authenticators', [
        {
          mnemonic: 'user/pass',
          keys: [{ name: 'username' }, { name: 'password' }],
        },
        {
          mnemonic: 'anon',
          keys: [],
        },
      ]);
      cy.visit('/login');
    });

    it('should show a dropdown', () => {
      cy.contains('Authenticator').should('be.visible');
      cy.get('#select-mnemonic').click();
      cy.contains('user/pass').should('be.visible');
      cy.contains('anon').should('be.visible');
    });

    it('should be able to select user/pass from the dropdown', () => {
      cy.get('#select-mnemonic').click();
      cy.contains('user/pass').click();

      cy.contains('Username*').should('be.visible');
      cy.contains('Password*').should('be.visible');
    });

    it('should be able to select anon from the dropdown', () => {
      cy.get('#select-mnemonic').click();
      cy.contains('anon').click();

      cy.contains('Sign In').should('not.be.disabled');
    });
  });

  describe('autoLogin', () => {
    beforeEach(() => {
      cy.server();
      cy.route('/settings.json', {
        plugins: [
          {
            name: 'demo_plugin',
            src: '/plugins/e2e-plugin/main.js',
            enable: true,
            location: 'main',
          },
        ],
        'ui-strings': 'res/default.json',
        'auth-provider': 'icat',
        authUrl: 'http://localhost:8000',
        'help-tour-steps': [],
      });
      cy.route('/authenticators', [
        {
          mnemonic: 'user/pass',
          keys: [{ name: 'username' }, { name: 'password' }],
        },
        {
          mnemonic: 'anon',
          keys: [],
        },
      ]);
      cy.route(
        'POST',
        '/login',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZXNzaW9uSWQiOiJ0ZXN0IiwidXNlcm5hbWUiOiJhbm9uL2Fub24iLCJleHAiOjkyMzQ5MjgzNDB9.KihH1oKHL3fpRG3EidyUWApAS4W-oHg7rsCM4Nuobuk'
      );
      cy.route('POST', '/verify', '');
    });

    it('should show the sidebar and yet still show the Sign in button', () => {
      cy.visit('/');

      cy.get('button[aria-label="Open navigation menu"]').should('be.visible');
      cy.contains('Sign in').should('be.visible');

      // test that token verification also works with autologin
      cy.reload();
      cy.get('button[aria-label="Open navigation menu"]').should('be.visible');
      cy.contains('Sign in').should('be.visible');

      // test that autologin works after token valididation + refresh fail
      cy.route({ method: 'POST', url: '/verify', status: 403 });
      cy.route({ method: 'POST', url: '/refresh', status: 403 });
      cy.reload();
      cy.get('button[aria-label="Open navigation menu"]').should('be.visible');
      cy.contains('Sign in').should('be.visible');
    });

    it('should not display as logged in if autologin requests fail', () => {
      cy.route({
        method: 'POST',
        url: '/login',
        status: 403,
      });

      cy.visit('/');

      cy.contains('Sign in').should('be.visible');
      cy.get('button[aria-label="Open navigation menu"]').should(
        'not.be.visible'
      );

      // test that autologin fails after token validation + refresh fail
      cy.route({ method: 'POST', url: '/verify', status: 403 });
      cy.route({ method: 'POST', url: '/refresh', status: 403 });
      cy.window().then(($window) =>
        $window.localStorage.setItem('scigateway:token', 'invalidtoken')
      );
      cy.reload();
      cy.contains('Sign in').should('be.visible');
      cy.get('button[aria-label="Open navigation menu"]').should(
        'not.be.visible'
      );
    });

    it('should be able to directly view a plugin route without signing in', () => {
      cy.visit('/plugin1');

      cy.get('#demo_plugin').contains('Demo Plugin').should('be.visible');
    });

    it('should be able to switch authenticators and still be "auto logged in"', () => {
      cy.visit('/login');

      cy.get('#select-mnemonic').click();
      cy.contains('anon').click();

      cy.contains('SciGateway').click();

      cy.get('button[aria-label="Open navigation menu"]').should('be.visible');
      cy.contains('Sign in').should('be.visible');
    });

    it('should be able to login after auto login and be displayed as logged in', () => {
      cy.visit('/login');

      cy.get('#select-mnemonic').click();
      cy.contains('anon').click();

      cy.get('#select-mnemonic')
        .parent()
        .parent()
        .parent()
        .contains('button', 'Sign in')
        .click();

      cy.get('button[aria-label="Open navigation menu"]').should('be.visible');
      cy.contains('Sign in').should('not.be.visible');
      cy.get('[aria-label="Open user menu"]').should('be.visible');
    });
  });
});
