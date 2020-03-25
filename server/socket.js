// @flow

import _ from 'lodash';
import type { Socket, IO } from 'socket.io';
import type { RedisClient } from 'async-redis';

import withEvents from './events';
import getSession from './session';
import type { Message } from './networkTypes';

export async function handleConnection(
  socket: Socket,
  io: IO,
  redisClient: RedisClient
) {
  const {
    sessionId,
    playerId,
  }: { sessionId: string, playerId: string } = socket.handshake.query;
  socket.join(sessionId);

  const session = getSession
    .register('changePhase', async () =>
      io.in(sessionId).emit('setState', await session.getAll())
    )
    .call({ id: sessionId, redisClient });

  if (!(await session.isInitialized())) await session.init();
  await session.join({ playerId });
  console.log(`My dudes, ${playerId} has joined session ${sessionId}`);

  const sessionData = await session.getAll();
  socket.emit('setState', sessionData);
  socket.to(sessionId).emit('updateState', sessionData);

  socket.on('disconnect', async () => {
    const { players, nodes, tokens } = await session.getAll();
    console.log(`Fam, ${playerId} has disconnected from ${sessionId}`);
    if (players[playerId] && players[playerId].name !== '') {
      await session.update('players', { [playerId]: { active: false } });
    } else {
      console.log(`Deleting player ${playerId}`);

      const playerNodes = _.filter(nodes, node =>
        _.includes(node.playerIds, playerId)
      );
      const playerTokens = _.filter(tokens, token =>
        _.some(playerNodes, ['id', token.nodeId])
      );
      await session.deleteObjects('players', playerId, players);
      await session.deleteObjects('nodes', _.map(playerNodes, 'id'), nodes);
      await session.deleteObjects('tokens', _.map(playerTokens, 'id'), tokens);
    }
  });

  socket.on('newMessage', async (message: Message) => {
    const serverState = await session.getAll();
    if (session.validMessage(serverState, message)) {
      socket
        .to(sessionId)
        .emit(
          'updateState',
          await session.integrateMessage(serverState, message)
        );
    } else socket.emit('setState', serverState);
  });

  // NOTE(gnewman): Perhaps this will solve the nasty uncaught errors bug...
  socket.on('error', console.error);
}
