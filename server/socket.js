// @flow

import type Socket from 'socket.io';

import getSession from './session';
import type { SessionInfo, Message } from './networkTypes';

export async function handleConnection(socket: Socket) {
  const {
    playerId,
    playerName,
    sessionId,
  }: SessionInfo = socket.handshake.query;
  socket.join(sessionId);

  const session = getSession(sessionId);
  await session.join({ playerId, playerName });
  console.log(`My dudes, ${playerName} has joined session ${sessionId}`);

  const sessionData = await session.getAll();
  socket.emit('setState', sessionData);
  socket.to(sessionId).emit('updateState', sessionData);

  socket.on('disconnect', () => {
    console.log(`Fam, ${playerName} has disconnected from ${sessionId}`);
    session.update('players', playerId, { active: false });
  });

  socket.on('newMessage', async (message: Message) => {
    if (await session.validMessage(message)) {
      socket
        .to(sessionId)
        .emit('updateState', await session.integrateMessage(message));
    } else socket.emit('setState', await session.getAll());
  });
}
