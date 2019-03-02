import redis from 'async-redis';
import _ from 'lodash';
import uniqid from 'uniqid';

function redisMethods(redisClient, id) {
  return {
    get: async key => JSON.parse((await redisClient.hget(id, key)) || '{}'),
    getAll: async () =>
      _.reduce(
        await redisClient.hgetall(id),
        (session, value, key) => ({
          ...session,
          [key]: JSON.parse(value),
        }),
        {}
      ),
    set: (key, value) => redisClient.hset(id, key, JSON.stringify(value)),
  };
}

export default function getSession(id) {
  const redisClient = redis.createClient();
  redisClient.on('error', function(err) {
    console.log('Error ' + err);
  });

  const { get, getAll, set } = redisMethods(redisClient, id);
  const update = async (key, id, object) => {
    const data = await get(key);
    set(key, {
      ...data,
      [id]: {
        ...data[id],
        ...object,
      },
    });
  };
  return {
    get,
    getAll,
    set,
    update,
    join: async ({ playerId, playerName }) => {
      const playersData = await get('players');
      if (playersData[playerId]) {
        await update('players', playerId, {
          active: true,
        });
        return;
      }

      await set('players', {
        ...playersData,
        [playerId]: {
          id: playerId,
          name: playerName,
          active: true,
        },
      });
      const nodesData = await get('nodes');
      const nodeId = uniqid();
      await set('nodes', {
        ...nodesData,
        [nodeId]: {
          id: nodeId,
          playerId,
        },
      });
      const tokensData = await get('tokens');
      const tokenId = uniqid();
      await set('tokens', {
        ...tokensData,
        [tokenId]: {
          id: tokenId,
          nodeId,
        },
      });
    },
    validMessage: () => true,
    integrateMessage: message => {
      console.log(`Integrating message ${message}`);
      return getAll();
    },
  };
}
