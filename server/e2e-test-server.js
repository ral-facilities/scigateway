import express from 'express';
import path from 'path';
import serveStatic from 'serve-static';
import axios from 'axios';

var app = express();

app.get('/settings.json', function (req, res) {
  res.sendFile(path.resolve('./server/e2e-settings.json'));
});

app.get('/plugins/*', function (req, res) {
  res.sendFile(
    path.resolve(`./server/${req.originalUrl.replace('/plugins/', '')}`)
  );
});

app.use(
  express.json(),
  serveStatic(path.resolve('./dist'), { index: ['index.html', 'index.htm'] })
);

app.post('/api/*', function (req, res) {
  axios
    .post('http://127.0.0.1:8000' + req.url, req.body)
    .then(apiRes => {
      res.send(apiRes.data);
    })
    .catch(error => {
      res.status(error.response.status).end();
    });
});

app.get('/*', function (req, res) {
  res.sendFile(path.resolve('./dist/index.html'));
});

app.listen(3000);
