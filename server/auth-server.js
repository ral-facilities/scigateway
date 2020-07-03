const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const qs = require('query-string');
const cookieParser = require('cookie-parser');
const https = require('https');
const fs = require('fs');
const waitOn = require('wait-on');

const app = express();
const port = 8000;
app.use(express.json());
app.use(cookieParser());

// this would normally be an environment variable
const jwtSecret = 'abc123456789';

let authUrl;
axios.get(`/settings.json`).then(res => {
  const settings = res.data;
  authUrl = settings['authUrl'];
});

const withAuth = function(req, res, next) {
  const token =
    req.body.token ||
    req.query.token ||
    req.headers['x-access-token'] ||
    req.headers.cookie;
  if (!token) {
    res.status(401).send('Unauthorized: No token provided');
  } else {
    jwt.verify(token, jwtSecret, function(err, decoded) {
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
  return username === 'username' && password === 'password';
}

app.post(`/api/jwt/authenticate`, function(req, res) {
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
    const accessToken = jwt.sign(payload, jwtSecret, {
      expiresIn: '1m',
    });
    const refreshToken = jwt.sign({}, jwtSecret, {
      expiresIn: '5m',
    });
    res.cookie('scigateway:refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.HTTPS,
      sameSite: 'lax',
      maxAge: 604800,
    });
    res.status(200).json({
      username,
      token: accessToken,
    });
  } else {
    res.status(401).json({
      error: 'Incorrect email or password',
    });
  }
});

app.post(`/api/jwt/checkToken`, withAuth, function(req, res) {
  const { token } = req.body;
  if (jwt.verify(token, jwtSecret)) {
    res.sendStatus(200);
  } else {
    res.status(401).json({
      error: 'Invalid token',
    });
  }
});

app.post(`/api/jwt/refresh`, function(req, res) {
  const refreshToken = req.cookies['scigateway:refresh_token'];
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

app.post(`/api/github/authenticate`, function(req, res) {
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
    .then(githubResponse => {
      token = qs.parse(githubResponse.data).access_token;
      return axios.get('https://api.github.com/user', {
        headers: { Authorization: `token ${token}` },
      });
    })
    .then(userResponse => {
      res.status(200).json({
        token,
        username: userResponse.data.login,
        avatar: userResponse.data.avatar_url,
      });
    })
    .catch(err => {
      res.status(401).json({
        error: 'Invalid token',
      });
    });
});

app.post(`/api/github/checkToken`, function(req, res) {
  const { token } = req.body;
  axios
    .get('https://api.github.com/user', {
      headers: { Authorization: `token ${token}` },
    })
    .then(userResponse => {
      res.status(200).json({
        username: userResponse.data.login,
        avatar: userResponse.data.avatar_url,
      });
    })
    .catch(err => {
      res.status(401).json({
        error: 'Invalid token',
      });
    });
});

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
