import getSession from './session';

export function handleConnection(socket) {
  const { playerName, sessionId } = socket.handshake.query;
  socket.join(sessionId);
  console.log(`My dudes, ${playerName} has joined session ${sessionId}`);

  const session = getSession(sessionId);

  socket.on('newMessage', async (message) => {
    if (await session.validMessage(message)) {
      await session.integrateMessage(message);
      socket.to(sessionId).emit('updateState', await session.getAll());
    } else
      socket.emit('setState', await session.getAll());
  });
}
