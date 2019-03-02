import _ from 'lodash';
import generateName from 'sillyname';
import uniqid from 'uniqid';

import getSession from './session';

export async function generateSessionId(request, response) {
  const sessionId = generateName();

  response.json({ sessionId });
}

export async function checkSession(request, response) {
  const { sessionId, playerName } = request.body;

  console.log(`${playerName} is checking to see if ${sessionId} is cool.`);
  const session = await getSession(sessionId);
  const players = await session.get('players');
  const playerId = _.findKey(players, player => player.name == playerName);
  if (players[playerId] && players[playerId].active) {
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
