// @flow

import express from 'express';

const app = express();

app.set('port', process.env.PORT || 3001);

app.post('/api/graph', (req, res) => {
  res.json({ message: 'nice' });
});

app.listen(app.get('port'), () => {
  console.log(
    `love-polygon server has started at http://localhost:${app.get('port')}/`
  );
});
