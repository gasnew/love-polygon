// @flow

import type { Socket, IO } from 'socket.io';

import withEvents from './events';
import getSession from './session';
import type { SessionInfo, Message } from './networkTypes';

export async function handleConnection(socket: Socket, io: IO) {
  const {
    playerId,
    playerName,
    sessionId,
  }: SessionInfo = socket.handshake.query;
  socket.join(sessionId);

  const session = getSession
    .register('changePhase', async () =>
      io.in(sessionId).emit('setState', await session.getAll())
    )
    .call({ id: sessionId });

  if (!(await session.exists())) await session.init();
  await session.join({ playerId, playerName });
  console.log(`My dudes, ${playerName} has joined session ${sessionId}`);

  const sessionData = await session.getAll();
  socket.emit('setState', sessionData);
  socket.to(sessionId).emit('updateState', sessionData);

  socket.on('disconnect', () => {
    console.log(`Fam, ${playerName} has disconnected from ${sessionId}`);
    session.update('players', { [playerId]: { active: false } });
  });

  socket.on('newMessage', async (message: Message) => {
    const serverState = await session.getAll();
    if (session.validMessage(serverState, message)) {
      socket
        .to(sessionId)
        .emit('updateState', await session.integrateMessage(message));
    } else socket.emit('setState', serverState);
  });
}
