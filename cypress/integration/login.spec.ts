describe('Login', () => {
  beforeEach(() => {
    // intercept these requests so they don't throw exceptions
    cy.intercept('/scheduled_maintenance', {}).as('scheduled_maintenance');
    cy.intercept('/maintenance', {}).as('maintenance');
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

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);
    cy.contains('Failed to log in. Invalid username or password.');
  });

  it('should reset login message when navigating from somewhere else', () => {
    cy.visit('/login');

    cy.contains('Username*').parent().find('input').type('wrongusername');
    cy.contains('Password*').parent().find('input').type('wrongpassword');

    cy.contains('Username*')
      .parent()
      .parent()
      .contains('button', 'Sign in')
      .click();

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);
    cy.contains('Failed to log in. Invalid username or password.');
    cy.visit('/test');
    cy.visit('/login');

    cy.contains('Username*').parent().find('input').should('exist');
    cy.contains('Failed to log in. Invalid username or password.').should(
      'not.exist'
    );
  });

  it('should login given correct credentials', () => {
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

    cy.window().then(
      (window) =>
        expect(window.localStorage.getItem('scigateway:token')).not.be.null
    );
  });

  it('should login given username with leading or trailing whitespace', () => {
    cy.visit('/login');
    cy.contains('Sign in').should('be.visible');

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
  });

  it('should remain logged in following page refresh or redirect', () => {
    cy.visit('/login');
    cy.contains('Sign in').should('be.visible');

    cy.contains('Username*').parent().find('input').type(' username');
    cy.contains('Password*').parent().find('input').type('password');

    cy.contains('Username*')
      .parent()
      .parent()
      .contains('button', 'Sign in')
      .click();

    cy.url().should('eq', 'http://127.0.0.1:3000/');

    let storedToken: string | null;

    cy.window().then((window) => {
      expect(window.localStorage.getItem('scigateway:token')).not.be.null;
      storedToken = window.localStorage.getItem('scigateway:token');
    });

    cy.reload();
    cy.window().then((window) => {
      expect(window.localStorage.getItem('scigateway:token')).not.be.null;
      expect(storedToken).to.equal(
        window.localStorage.getItem('scigateway:token')
      );
    });
    cy.contains('Sign in').should('not.exist');

    cy.visit('/help');
    cy.window().then((window) => {
      expect(window.localStorage.getItem('scigateway:token')).not.be.null;
      expect(storedToken).to.equal(
        window.localStorage.getItem('scigateway:token')
      );
    });
    cy.contains('Sign in').should('not.exist');
  });

  it('should redirect to logout page if logged in and navigating to login page', () => {
    cy.login('username', 'password');
    cy.visit('/login');
    cy.url().should('eq', 'http://127.0.0.1:3000/logout');
  });

  it('should redirect to Home page if not logged in and navigating to logout page', () => {
    cy.visit('/logout');
    cy.url().should('eq', 'http://127.0.0.1:3000/login');
  });

  it('should not be logged in if invalid or unsigned token in localStorage', () => {
    // if token cannot be deciphered
    cy.contains('Sign in').should('be.visible');
    window.localStorage.setItem('scigateway:token', 'invalidtoken');
    cy.reload();
    cy.contains('Sign in').should('be.visible');
    cy.window().then(
      (window) =>
        expect(window.localStorage.getItem('scigateway:token')).to.be.null
    );

    // if token is recognised as a JWT but is not recognised as signed by the auth provider
    const testInvalidToken =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpYXQiOjE2MTcyMDE4MDYsImV4cCI6MTYxNzIwMTg2Nn0.6DKXkw8zbHurAjBxDCY9zLrIB4NwPJL7GaCs_LArEmM';
    window.localStorage.setItem('scigateway:token', testInvalidToken);
    cy.reload();
    cy.contains('Sign in').should('be.visible');
    cy.window().then(
      (window) =>
        expect(window.localStorage.getItem('scigateway:token')).to.be.null
    );
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
      cy.intercept('/settings.json', {
        plugins: [],
        'ui-strings': 'res/default.json',
        'auth-provider': 'icat',
        authUrl: 'http://localhost:8000',
        'help-tour-steps': [],
      }).as('settings');
      cy.intercept('/authenticators', [
        {
          mnemonic: 'user/pass',
          keys: [{ name: 'username' }, { name: 'password' }],
        },
        {
          mnemonic: 'nokey',
          keys: [],
        },
        {
          mnemonic: 'simple',
          keys: [{ name: 'username' }, { name: 'password' }],
          admin: true,
        },
        {
          mnemonic: 'anon',
          keys: [],
        },
      ]).as('auths');
      cy.visit('/login');
    });

    it('should show a dropdown with filtered out admin and anon authenticators', () => {
      cy.contains('Authenticator').should('be.visible');
      cy.get('#select-mnemonic').click();
      cy.contains('user/pass').should('be.visible');
      cy.contains('nokey').should('be.visible');
      cy.contains('anon').should('not.exist');
      cy.contains('ldap').should('not.exist');
    });

    it('should be able to select user/pass from the dropdown', () => {
      cy.get('#select-mnemonic').click();
      cy.contains('user/pass').click();

      cy.contains('Username*').should('be.visible');
      cy.contains('Password*').should('be.visible');
    });

    it('should be able to select nokey from the dropdown', () => {
      cy.get('#select-mnemonic').click();
      cy.get('ul li').contains('nokey').click();

      cy.contains('Sign in').should('not.be.disabled');
    });
  });

  describe('autoLogin on', () => {
    // Define responses for login attempts
    let verifyResponse: { statusCode: Number; body: string };
    let loginResponse: { statusCode: Number; body: string };
    const verifySuccess = { statusCode: 200, body: '' };
    const loginSuccess = {
      statusCode: 200,
      body: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZXNzaW9uSWQiOiJ0ZXN0IiwidXNlcm5hbWUiOiJhbm9uL2Fub24iLCJleHAiOjkyMzQ5MjgzNDB9.KihH1oKHL3fpRG3EidyUWApAS4W-oHg7rsCM4Nuobuk',
    };
    const failure = { statusCode: 403, body: '' };

    beforeEach(() => {
      cy.intercept('/settings.json', {
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
        autoLogin: true,
        'help-tour-steps': [],
      });
      cy.intercept('/authenticators', [
        {
          mnemonic: 'user/pass',
          keys: [{ name: 'username' }, { name: 'password' }],
        },
        {
          mnemonic: 'nokey',
          keys: [],
        },
      ]);
      cy.intercept('POST', '/login', (req) => {
        req.reply(loginResponse);
      });
      cy.intercept('POST', '/verify', (req) => {
        req.reply(verifyResponse);
      });
    });

    it('should allow access to plugins and yet still show the Sign in button', () => {
      verifyResponse = verifySuccess;
      loginResponse = loginSuccess;
      cy.visit('/plugin1');

      cy.get('#demo_plugin').contains('Demo Plugin').should('be.visible');
      cy.contains('Sign in').should('be.visible');

      // test that token verification also works with autologin
      cy.reload();
      cy.get('#demo_plugin').contains('Demo Plugin').should('be.visible');
      cy.contains('Sign in').should('be.visible');

      // test that autologin works after token validation + refresh fail
      verifyResponse = failure;
      cy.intercept('POST', '/refresh', { statusCode: 403 });
      cy.reload();
      cy.get('#demo_plugin').contains('Demo Plugin').should('be.visible');
      cy.contains('Sign in').should('be.visible');
    });

    it('should not be logged in if autologin requests fail', () => {
      loginResponse = failure;
      verifyResponse = verifySuccess;

      cy.visit('/plugin1');
      cy.get('#demo_plugin').should('not.exist');
      cy.contains('h1', 'Sign in').should('be.visible');

      // test that autologin fails after token validation + refresh fail
      verifyResponse = failure;
      cy.intercept('POST', '/refresh', { statusCode: 403 });
      cy.window().then(($window) =>
        $window.localStorage.setItem('scigateway:token', 'invalidtoken')
      );
      cy.reload();
      cy.get('#demo_plugin').should('not.exist');
      cy.contains('h1', 'Sign in').should('be.visible');
    });

    it('should be able to directly view a plugin route without signing in', () => {
      verifyResponse = verifySuccess;
      loginResponse = loginSuccess;
      cy.visit('/plugin1');

      cy.get('#demo_plugin').contains('Demo Plugin').should('be.visible');
    });

    it('should be able to switch authenticators and still be "auto logged in"', () => {
      verifyResponse = verifySuccess;
      loginResponse = loginSuccess;
      cy.visit('/login');

      cy.get('#select-mnemonic').click();
      cy.contains('nokey').click();

      cy.get('[alt="SciGateway"]').click();

      cy.contains('Sign in').should('be.visible');
    });

    it('should be able to login after auto login and be displayed as logged in', () => {
      verifyResponse = verifySuccess;
      loginResponse = loginSuccess;
      cy.visit('/login');

      cy.get('#select-mnemonic').click();
      cy.contains('nokey').click();

      cy.get('#select-mnemonic')
        .parent()
        .parent()
        .parent()
        .contains('button', 'Sign in')
        .click();

      cy.contains('Sign in').should('not.exist');
      cy.get('[aria-label="Open user menu"]').should('be.visible');
    });

    it('should autoLogin after logout', () => {
      window.localStorage.setItem(
        'scigateway:token',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZXNzaW9uSWQiOiJ0ZXN0LXVzZXIiLCJ1c2VybmFtZSI6InRlc3QtdXNlciIsImV4cCI6OTIzNDkyODM0MH0.MXtdkSQbam5QRTgzO_FExlKCu6p531k35Dhjhb5PRrQ'
      );
      verifyResponse = verifySuccess;
      loginResponse = loginSuccess;
      cy.visit('/');
      cy.title().should('equal', 'SciGateway');

      cy.get('[aria-label="Open user menu"]').click();

      cy.contains('Sign out').click();

      cy.contains('Sign in').should('be.visible');
      cy.contains('a', 'Demo Plugin').should('be.visible');
      cy.contains('a', 'Demo Plugin').click();

      cy.url().should('contain', '/plugin1');
      cy.contains('div', 'Demo Plugin').should('be.visible');
    });
  });

  describe('autoLogin off', () => {
    beforeEach(() => {
      cy.intercept('/settings.json', {
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
        autoLogin: false,
        'help-tour-steps': [],
      });
    });

    it('should not attempt to auto login in if autoLogin setting is set to false', () => {
      cy.visit('/plugin1');
      cy.get('#demo_plugin').should('not.exist');
      cy.contains('h1', 'Sign in').should('be.visible');
      cy.contains('Unable to create anonymous session').should('not.exist');
    });
  });
});
