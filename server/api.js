// @flow

import fs from 'fs';
import _ from 'lodash';
import redis from 'async-redis';
import uniqid from 'uniqid';
import type { $Request, $Response } from 'express';

import { getBaseSession, sessionExists } from './session';
import { VALID_SESSION_ID_CHARACTERS, SESSION_ID_LENGTH } from './constants';
import type { Players } from './networkTypes';

type Request<Body> = {
  ...$Request,
  body: Body,
};

type SessionCheck = {
  sessionId: string,
};
export async function checkSession(
  request: Request<SessionCheck>,
  response: $Response
) {
  const { sessionId }: SessionCheck = request.body;

  console.log(`Someone is checking to see if ${sessionId} is cool.`);
  if (sessionId === '') {
    response.json({ error: 'Please enter a session ID' });
  } else if (
    !(await sessionExists(request.app.get('redisClient'), sessionId))
  ) {
    response.json({
      error: `The session "${sessionId}" does not exist. Try creating a new session instead!`,
    });
  } else response.json({});
}

export async function createSession(request: $Request, response: $Response) {
  const generateSessionId = () =>
    _.join(
      _.map(_.range(SESSION_ID_LENGTH), () =>
        _.sample(VALID_SESSION_ID_CHARACTERS)
      ),
      ''
    );

  let sessionId = generateSessionId();
  let iterations = 0;
  while (await sessionExists(request.app.get('redisClient'), sessionId)) {
    if (iterations > 100) {
      response.json({ error: 'Unique session ID could not be found' });
      return;
    }
    sessionId = generateSessionId();
    iterations += 1;
  }

  response.json({ sessionId });
}

type GetState = {
  sessionId: string,
};
export async function getServerState(
  request: Request<GetState>,
  response: $Response
) {
  const { sessionId: id }: GetState = request.body;

  console.log(`Fetching current session state for session ${id}`);

  response.json(
    await (await getBaseSession({
      id,
      redisClient: request.app.get('redisClient'),
    })).getAll()
  );
}

type LoadSession = {
  sessionId: string,
};
export async function loadSessionFromCache(
  request: Request<LoadSession>,
  response: $Response
) {
  const { sessionId: id }: GetState = request.body;

  console.log(`Loading session ${id} from session state cache...`);

  const session = await getBaseSession({
    id,
    redisClient: request.app.get('redisClient'),
  });
  _.each(
    JSON.parse(fs.readFileSync('debugSessionStateCache.json')),
    async (value, key) => await session.set(key, value)
  );

  response.json({ success: true });
}
