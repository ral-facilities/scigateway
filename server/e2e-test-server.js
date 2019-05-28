var express = require('express');
var path = require('path');
var serveStatic = require('serve-static');
var axios = require('axios');

var app = express();

app.get('/settings.json', function(req, res) {
  console.log('getting settings');
  res.sendFile(path.join(__dirname, 'e2e-settings.json'));
});

app.get('/plugins/*', function(req, res) {
  console.log(req.originalUrl.replace('/plugins/', ''));
  res.sendFile(path.join(__dirname, req.originalUrl.replace('/plugins/', '')));
});

app.use(
  express.json(),
  serveStatic(path.resolve('./build'), { index: ['index.html', 'index.htm'] })
);

app.post('/api/*', function(req, res) {
  axios
    .post('http://127.0.0.1:8000' + req.url, req.body)
    .then(apiRes => {
      res.send(apiRes.data);
    })
    .catch(error => {
      res.status(error.response.status).end();
    });
});

app.get('/*', function(req, res) {
  res.sendFile(path.resolve('./build/index.html'));
});

app.listen(3000);
