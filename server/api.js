// @flow

import _ from 'lodash';
import generateName from 'sillyname';
import uniqid from 'uniqid';
import type { $Request, $Response } from 'express';

import getSession from './session';
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
  const session = getSession(sessionId);
  const players = (await session.getAll()).players;
  const playerId = _.findKey(players, player => player.name == playerName);
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
