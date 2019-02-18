// @flow

import express from 'express';

import { generateSessionId, joinSession } from './api';

// Express
const app = express();

app.set('port', process.env.PORT || 3001);

app.use(express.json());

app.post('/api/get-session-id', generateSessionId);
app.post('/api/join-session', joinSession);

app.listen(app.get('port'), () => {
  console.log(
    `love-polygon server has started at http://localhost:${app.get('port')}/`
  );
});
