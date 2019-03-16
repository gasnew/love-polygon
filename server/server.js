// @flow

import express from 'express';
import { createServer } from 'http';
import createIO from 'socket.io';

import { generateSessionId, checkSession } from './api';
import { handleConnection } from './socket';

// Express
const app = express();
const server = createServer(app);
const io = createIO(server);

const port = process.env.PORT || 3001;
app.set('port', port);

app.use(express.json());

app.post('/api/get-session-id', generateSessionId);
app.post('/api/check-session', checkSession);

io.on('connection', socket => handleConnection(socket, io));

server.listen(app.get('port'), () => {
  console.log(`love-polygon server has started at http://localhost:${port}/`);
});
