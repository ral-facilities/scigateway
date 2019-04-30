const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const qs = require('query-string');
const app = express()
const port = 8000

// this would normally be an environment variable
const jwtSecret = 'abc123456789'

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
}

app.use(express.json());

function isValidLogin(username, password) {
  // this would normally be a database lookup
  return username === 'username' && password === 'password';
}

app.post('/api/jwt/authenticate', function(req, res) {
  const { username, password } = req.body;

    if (username === 'error') {
      res.status(500)
        .json({
        error: 'Internal error please try again'
      });
    }
    
    if (!username) {
      res.status(401).json({
        error: 'Incorrect email or password'
      });
    } else if (isValidLogin(username, password)) {
        // Issue token
        const payload = { username };
        const token = jwt.sign(payload, jwtSecret, {
          expiresIn: '1h'
        });
        res.status(200).json({
          username,
          token
        });
    } else {
      res.status(401).json({
        error: 'Incorrect email or password'
      });
    }
});

app.post('/api/jwt/checkToken', withAuth, function(req, res) {
  const { token } = req.body;
  if (jwt.verify(token, jwtSecret)) {
    res.sendStatus(200);
  } else {
    res.status(401).json({
      error: 'Invalid token'
    });
  }
  
})

app.post('/api/github/authenticate', function(req, res) {
  const { code } = req.body;

  const headers = {
    'User-Agent': 'request'
  }

  let token = '';

  axios.post('https://github.com/login/oauth/access_token?' +
            'client_id=9fb0c571fd7b71e383b4&' +
            'client_secret=6960ea90387e3d0ff0a2f62764ab9cc7d5927c46&' +
            `code=${code}`, headers)
  .then((githubResponse) => {
    token = qs.parse(githubResponse.data).access_token;
    return axios.get('https://api.github.com/user', { headers: {'Authorization': `token ${token}`}});
  })
  .then((userResponse) => {
    res.status(200).json({
      token,
      username: userResponse.data.login,
      avatar: userResponse.data.avatar_url
    });
  })
  .catch((err) => {
    res.status(401).json({
      error: 'Invalid token'
    });     
  })  
})

app.post('/api/github/checkToken', function(req, res) {
  const { token } = req.body;
  axios.get('https://api.github.com/user', { headers: {'Authorization': `token ${token}`}})
  .then((userResponse) => {
    res.status(200).json({
      username: userResponse.data.login,
      avatar: userResponse.data.avatar_url
    });
  })
  .catch((err) => {
    res.status(401).json({
      error: 'Invalid token'
    });     
  }) 
  
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))