import generateName from 'sillyname';

import getSession from './session';

export async function generateSessionId(request, response) {
  const id = generateName();
  const sessionId = { id };

  response.json({ message: sessionId });
}

export async function joinSession(request, response) {
  const { sessionId, playerName } = request.body;

  const session = getSession(sessionId);
  const playerData = JSON.parse(await session.get('players'));
  await session.set('players', {
    ...playerData,
    [playerName]: {
      ok: 'dude',
    },
  });

  const sessionData = await session.getAll();
  response.json({ message: sessionData });
}
