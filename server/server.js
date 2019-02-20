// @flow

import express from 'express';
import { createServer } from 'http';
import createIO from 'socket.io';

import { generateSessionId, joinSession } from './api';
import { handleConnection } from './socket';

// Express
const app = express();
const server = createServer(app);
const io = createIO(server);

app.set('port', process.env.PORT || 3001);

app.use(express.json());

app.post('/api/get-session-id', generateSessionId);
app.post('/api/join-session', joinSession);

io.on('connection', handleConnection);

server.listen(app.get('port'), () => {
  console.log(
    `love-polygon server has started at http://localhost:${app.get('port')}/`
  );
});
