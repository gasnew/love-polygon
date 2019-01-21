// @flow

import express from 'express';

import { registerPlayer } from './api';

// Express
const app = express();

app.set('port', process.env.PORT || 3001);

app.use(express.json());

app.post('/api/register', registerPlayer);

app.listen(app.get('port'), () => {
  console.log(
    `love-polygon server has started at http://localhost:${app.get('port')}/`
  );
});
