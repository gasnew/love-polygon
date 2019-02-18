import redis from 'async-redis';
import _ from 'lodash';
import generateName from 'sillyname';

export async function generateSessionId(request, response) {
  const id = generateName();
  const sessionData = { id };

  response.json({ message: sessionData });
}

export async function joinSession(request, response) {
  const { sessionId, playerName } = request.body;

  const redisClient = redis.createClient();
  redisClient.on('error', function(err) {
    console.log('Error ' + err);
  });
  const playerData = JSON.parse(await redisClient.hget(sessionId, 'players'));
  await redisClient.hset(
    sessionId,
    'players',
    JSON.stringify({
      ...playerData,
      [playerName]: {
        ok: 'dude',
      },
    })
  );
  const session = _.reduce(
    await redisClient.hgetall(sessionId),
    (session, value, key) => ({
      ...session,
      [key]: JSON.parse(value),
    }),
    {}
  );

  response.json({ message: session });
}
