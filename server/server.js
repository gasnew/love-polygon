// @flow

import cors from 'cors';
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

// Allow everyone to talk to me when not prod
// To whitelist specific origins:
//   app.use(cors({ origin: 'http://localhost:3000' }));
if (process.env.NODE_ENV !== 'production')
  app.use(cors());

const server = createServer((request, response, ...args) => {
  app(request, response, ...args);
  // NOTE(gnewman): Try to handle otherwise unhandled errors. Looks like this
  // doesn't solve the problem we've been seeing
  request.on('error', err => {
    console.error(`Request error: ${err}`);
    response.statusCode = 400;
    response.end();
  });
  response.on('error', err => {
    console.error(`Response error: ${err}`);
  });
});
const io = createIO(server);

const redisClient = redis.createClient();
redisClient.on('error', function(err) {
  console.log('Redis error ' + err);
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
