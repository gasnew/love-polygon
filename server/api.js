import redis from 'async-redis';

export async function registerPlayer(request, response) {
  const redisClient = redis.createClient();
  await redisClient.set('lol', 'mymessage');
  const message = await redisClient.get('lol');
  response.json({ message });
}
