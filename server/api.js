// @flow

import _ from 'lodash';
import generateName from 'sillyname';
import uniqid from 'uniqid';
import type { $Request, $Response } from 'express';

import { getBaseSession } from './session';
import type { Players } from './networkTypes';

export async function generateSessionId(
  request: $Request,
  response: $Response
) {
  const sessionId = generateName();

  response.json({ sessionId });
}

type SessionCheck = {
  sessionId: string,
  playerName: string,
};
type CheckRequest = {
  ...$Request,
  body: SessionCheck,
};
export async function checkSession(request: CheckRequest, response: $Response) {
  const { sessionId, playerName }: SessionCheck = request.body;

  console.log(`${playerName} is checking to see if ${sessionId} is cool.`);
  const session = getBaseSession({ id: sessionId });
  const { phase, players } = await session.getAll();
  const playerId = _.findKey(players, player => player.name == playerName);
  if (!playerId && phase && phase.name !== 'lobby') {
    response.json({
      error: {
        field: 'sessionId',
        message: `Session ${playerName} is ongoing. Please choose another
        session.`,
      },
    });
    return;
  }
  if (playerId && players[playerId].active) {
    response.json({
      error: {
        field: 'playerId',
        message: `A player named ${playerName} is already in this session!
        Please choose another name`,
      },
    });
    return;
  }

  response.json({ playerId: playerId || uniqid() });
}
