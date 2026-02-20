import axios from 'axios';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import fs from 'fs';
import https from 'https';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { URLSearchParams } from 'url';
import waitOn from 'wait-on';

const app = express();
const port = 8000;
app.use(cors());
app.use(express.json());
app.use(express.text());
app.use(cookieParser());

// this would normally be an environment variable
const jwtSecret = 'abc123456789';
const keycloakSecret = 'secret';

const oidcProviders = {
  pkce: {
    configuration_url:
      'http://localhost:8081/realms/testrealm/.well-known/openid-configuration',
    display_name: 'Keycloak (PKCE)',
    pkce: true,
    scope: 'openid profile email',
    client_id: 'test-pkce-client-id',
  },
  non_pkce: {
    configuration_url:
      'http://localhost:8081/realms/testrealm/.well-known/openid-configuration',
    display_name: 'Keycloak (Non-PKCE)',
    pkce: false,
    scope: 'openid',
    client_id: 'test-non-pkce-client-id',
  },
};

const withAuth = function (req, res, next) {
  const token =
    req.body.token ||
    req.query.token ||
    req.headers['x-access-token'] ||
    req.headers.cookie ||
    req.headers.authorization?.split(' ')?.[1];
  if (!token) {
    res.status(401).send('Unauthorized: No token provided');
  } else {
    jwt.verify(token, jwtSecret, function (err, decoded) {
      if (err) {
        res.status(401).send('Unauthorized: Invalid token');
      } else {
        req.username = decoded.username;
        next();
      }
    });
  }
};

function isValidLogin(username, password) {
  // this would normally be a database lookup
  return (
    (username === 'username' && password === 'password') ||
    (username === 'admin' && password === 'password')
  );
}

app.post(`/login`, function (req, res) {
  const { username, password } = req.body;

  if (username === 'error') {
    res.status(500).json({
      error: 'Internal error please try again',
    });
  }

  if (!username) {
    res.status(401).json({
      error: 'Incorrect email or password',
    });
  } else if (isValidLogin(username, password)) {
    // Issue token
    const payload = { username };
    if (username === 'admin') payload.userIsAdmin = true;
    const accessToken = jwt.sign(payload, jwtSecret, {
      expiresIn: '1m',
    });
    const refreshToken = jwt.sign({}, jwtSecret, {
      expiresIn: '5m',
    });
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.HTTPS,
      sameSite: 'lax',
      maxAge: 604800,
    });
    res.status(200).json(accessToken);
  } else {
    res.status(401).json({
      error: 'Incorrect email or password',
    });
  }
});

app.post(`/oidc_token/:provider_id`, async function (req, res) {
  const code = req.body;
  const { provider_id } = req.params;

  if (!code || !provider_id) {
    res.status(400).json({
      error: `Code or provider_id missing from request: code: ${code}, provider_id: ${provider_id}`,
    });
    return;
  }

  const oidc_config = (
    await axios.get(oidcProviders[provider_id].configuration_url)
  ).data;

  const token_endpoint = oidc_config['token_endpoint'];

  const params = new URLSearchParams();

  params.append('code', code);
  params.append('client_id', oidcProviders[provider_id].client_id);
  params.append('grant_type', 'authorization_code');
  params.append('redirect_uri', `http://localhost:3000/login`);
  params.append('client_secret', keycloakSecret);

  try {
    const { data } = await axios.post(token_endpoint, params);
    res.status(200).json(data);
  } catch (error) {
    if (error.response) {
      res.status(error.response.status).send(error.response.data);
    } else {
      res.status(500).send(error.message);
    }
  }
});

app.post(`/oidc_login/:provider_id`, async function (req, res) {
  const { provider_id } = req.params;

  const token = req.headers.authorization?.replace('Bearer ', '');

  const kid = jwt.decode(token, { complete: true })?.header?.kid;

  if (!token || !kid || !provider_id) {
    res.status(400).json({
      error: `Something missing from request: token: ${token}, kid: ${kid}, provider_id: ${provider_id}`,
    });
    return;
  }

  const oidc_config = (
    await axios.get(oidcProviders[provider_id].configuration_url)
  ).data;

  const jwks_uri = oidc_config['jwks_uri'];

  const client = jwksClient({
    jwksUri: jwks_uri,
    requestHeaders: {}, // Optional
    timeout: 30000, // Defaults to 30s
  });

  const key = await client.getSigningKey(kid);

  if (!key) {
    res.status(500).json({
      error: 'Missing key for specified kid',
    });
    return;
  }

  const decodedToken = jwt.verify(token, key.getPublicKey(), {
    algorithms: [key.alg],
  });
  if (!decodedToken) {
    res.status(401).json({
      error: 'Invalid token',
    });
    return;
  }

  // Issue token
  const payload = { username: decodedToken.email ?? decodedToken.sub };
  const accessToken = jwt.sign(payload, jwtSecret, {
    expiresIn: '1m',
  });
  const refreshToken = jwt.sign({}, jwtSecret, {
    expiresIn: '5m',
  });
  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.HTTPS,
    sameSite: 'lax',
    maxAge: 604800,
  });
  res.status(200).json(accessToken);
});

app.get('/oidc_providers', function (_req, res) {
  res.status(200).json(oidcProviders);
});

app.post(`/verify`, withAuth, function (req, res) {
  const { token } = req.body;
  if (jwt.verify(token, jwtSecret)) {
    res.sendStatus(200);
  } else {
    res.status(401).json({
      error: 'Invalid token',
    });
  }
});

app.post(`/refresh`, function (req, res) {
  const refreshToken = req.cookies['refresh_token'];
  const accessToken = req.body.token;

  try {
    jwt.verify(refreshToken, jwtSecret);
  } catch (err) {
    res.status(401).json({
      error: 'Invalid refresh token',
    });
    return;
  }
  try {
    const payload = jwt.verify(accessToken, jwtSecret, {
      ignoreExpiration: true,
    });
    delete payload.iat;
    delete payload.exp;
    const newAccessToken = jwt.sign(payload, jwtSecret, {
      expiresIn: '1m',
    });
    res.status(200).json({
      token: newAccessToken,
    });
  } catch (err) {
    res.status(401).json({
      error: 'Invalid access token',
    });
  }
});

let scheduledMaintenanceState = {
  show: false,
  message: '',
  severity: 'info',
};
let maintenanceState = {
  show: false,
  message: 'message',
};

// Fetch Scheduled Maintenance State
app.get('/scheduled_maintenance', function (req, res) {
  res.status(200).json(scheduledMaintenanceState);
});

// Fetch Maintenance State
app.get('/maintenance', function (req, res) {
  res.status(200).json(maintenanceState);
});

app.post(`/scheduled_maintenance`, withAuth, function (req, res) {
  const token = jwt.verify(
    req.headers.authorization?.split(' ')?.[1],
    jwtSecret
  );
  if (token && typeof token !== 'string' && token.userIsAdmin) {
    scheduledMaintenanceState = req.body;
    res
      .status(200)
      .json('Scheduled maintenance mode state successfully updated');
  } else {
    res.status(403).json({
      error: 'Unauthorized',
    });
  }
});

app.post(`/maintenance`, withAuth, function (req, res) {
  const token = jwt.verify(
    req.headers.authorization?.split(' ')?.[1],
    jwtSecret
  );
  if (token && typeof token !== 'string' && token.userIsAdmin) {
    maintenanceState = req.body;
    res.status(200).json('Maintenance mode state successfully updated');
  } else {
    res.status(403).json({
      error: 'Unauthorized',
    });
  }
});

app.post(`/github/login`, function (req, res) {
  const { code } = req.body;

  const headers = {
    'User-Agent': 'request',
  };

  let token = '';

  axios
    .post(
      'https://github.com/login/oauth/access_token?' +
        'client_id=9fb0c571fd7b71e383b4&' +
        'client_secret=6960ea90387e3d0ff0a2f62764ab9cc7d5927c46&' +
        `code=${code}`,
      headers
    )
    .then((githubResponse) => {
      token = new URLSearchParams(githubResponse.data).get('access_token');
      return axios.get('https://api.github.com/user', {
        headers: { Authorization: `token ${token}` },
      });
    })
    .then((userResponse) => {
      res.status(200).json({
        token,
        username: userResponse.data.login,
        avatar: userResponse.data.avatar_url,
      });
    })
    .catch((err) => {
      res.status(401).json({
        error: 'Invalid token',
      });
    });
});

app.post(`/github/verify`, function (req, res) {
  const { token } = req.body;
  axios
    .get('https://api.github.com/user', {
      headers: { Authorization: `token ${token}` },
    })
    .then((userResponse) => {
      res.status(200).json({
        username: userResponse.data.login,
        avatar: userResponse.data.avatar_url,
      });
    })
    .catch((err) => {
      res.status(401).json({
        error: 'Invalid token',
      });
    });
});

const e2e = process.argv[2] === 'e2e';

if (!e2e) {
  try {
    const settings = JSON.parse(fs.readFileSync('./public/settings.json'));
    if (settings['authUrl'] !== `http://localhost:${port}`) {
      console.log(
        `authUrl is not set to example auth server URL so not starting example auth server`
      );
      process.exit(0);
    }
  } catch (e) {
    console.log('No settings file found so not starting example auth server');
    process.exit(0);
  }
}

if (process.env.HTTPS) {
  waitOn({
    resources: ['./node_modules/webpack-dev-server/ssl/server.pem'],
    timeout: 30000,
  })
    .then(() => {
      https
        .createServer(
          {
            key: fs.readFileSync(
              './node_modules/webpack-dev-server/ssl/server.pem'
            ),
            cert: fs.readFileSync(
              './node_modules/webpack-dev-server/ssl/server.pem'
            ),
          },
          app
        )
        .listen(port, () =>
          console.log(`Example app listening to HTTPS traffic on port ${port}!`)
        );
    })
    .catch(() => {
      console.error(
        `Error: could not find auto-generated webpack-dev-server certificate when attempting to start HTTPS server`
      );
      process.exit(1);
    });
} else {
  app.listen(port, () =>
    console.log(`Example app listening to HTTP traffic on port ${port}!`)
  );
}
