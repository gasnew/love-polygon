import redis from 'async-redis';
import generateName from 'sillyname';

export async function registerPlayer(request, response) {
  const { id } = request.body;
  const playerData = { name: generateName() };

  const redisClient = redis.createClient();
  redisClient.on('error', function(err) {
    console.log('Error ' + err);
  });
  console.log(id, playerData);
  await redisClient.hset('players', id, JSON.stringify(playerData));

  response.json({ message: playerData });
}
