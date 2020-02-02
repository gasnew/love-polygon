// @flow

import express from 'express';
import { createServer } from 'http';
import redis from 'async-redis';
import createIO from 'socket.io';

import {
  checkSession,
  createSession,
  getServerState,
  loadSessionFromCache,
} from './api';
import { handleConnection } from './socket';

// Express
const app = express();
const server = createServer(app);
const io = createIO(server);

const redisClient = redis.createClient();
redisClient.on('error', function(err) {
  console.log('Error ' + err);
});

const port = process.env.PORT || 3001;
app.set('port', port);
app.set('redisClient', redisClient);

app.use(express.json());

app.post('/api/check-session', checkSession);
app.get('/api/create-session', createSession);
app.post('/api/get-server-state', getServerState);
app.post('/api/load-session-from-cache', loadSessionFromCache);

io.on('connection', socket => handleConnection(socket, io, redisClient));

server.listen(app.get('port'), () => {
  console.log(`love-polygon server has started at http://localhost:${port}/`);
});
