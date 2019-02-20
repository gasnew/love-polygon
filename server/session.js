import redis from 'async-redis';
import _ from 'lodash';

export default function getSession(id) {
  const redisClient = redis.createClient();
  redisClient.on('error', function(err) {
    console.log('Error ' + err);
  });

  return {
    get: key => redisClient.hget(id, key),
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
    validMessage: () => true,
    integrateMessage: (message) => {
      return message;
    },
  };
}
