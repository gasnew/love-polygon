// @flow

import redis from 'async-redis';
import _ from 'lodash';
import uniqid from 'uniqid';

import getFollowEdge from './phase';

import type {
  Message,
  PhaseName,
  Players,
  ServerState,
  ServerStateKeys,
  SubServerState,
} from './networkTypes';

type RedisMethods = {|
  getAll: () => Promise<ServerState>,
  set: (ServerStateKeys, SubServerState) => void,
|};

function redisMethods(redisClient, id): RedisMethods {
  return {
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

type Session = {|
  ...RedisMethods,
  update: (ServerStateKeys, string, mixed) => Promise<void>,
  exists: () => Promise<boolean>,
  init: () => Promise<void>,
  join: ({ playerId: string, playerName: string }) => Promise<void>,
  validMessage: Message => boolean,
  integrateMessage: Message => Promise<ServerState>,
|};

export default function getSession(id: string): Session {
  const redisClient = redis.createClient();
  redisClient.on('error', function(err) {
    console.log('Error ' + err);
  });

  const { getAll, set } = redisMethods(redisClient, id);
  const update = async (key, id, object) => {
    const data = (await getAll())[key];
    set(key, {
      ...data,
      [id]: {
        ...data[id],
        ...object,
      },
    });
  };

  const getPhaseName = async () => (await getAll()).phase.name;
  const setPhaseName = (name: PhaseName) => set('phase', { name });
  const startGame = async () => {
    const { players } = await getAll();
    console.log('start game now');
  };

  const followEdge = getFollowEdge({ getPhaseName, setPhaseName, startGame });

  const quorum = async (): Promise<boolean> => {
    const { nodes, tokens } = await getAll();
    const loveBuckets = _.pickBy(nodes, ['type', 'loveBucket']);
    return _.filter(tokens, token => loveBuckets[token.nodeId]).length >= 2;
  };

  return {
    getAll,
    set,
    update,
    exists: async () => (await getAll()).phase !== undefined,
    init: async () => {
      await setPhaseName('lobby');
      await set('players', {});
      await set('nodes', {});
      await set('tokens', {});
    },
    join: async ({ playerId, playerName }) => {
      const sessionData = await getAll();
      const playersData = sessionData.players || {};
      if (playersData[playerId]) {
        await update('players', playerId, { active: true });
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

      const nodesData = sessionData.nodes;
      const nodeId1 = uniqid();
      const nodeId2 = uniqid();
      await set('nodes', {
        ...nodesData,
        [nodeId1]: {
          id: nodeId1,
          playerId,
          type: 'storage',
        },
        [nodeId2]: {
          id: nodeId2,
          playerId,
          type: 'loveBucket',
        },
      });
      const tokensData = sessionData.tokens;
      const tokenId = uniqid();
      await set('tokens', {
        ...tokensData,
        [tokenId]: {
          id: tokenId,
          nodeId: nodeId1,
        },
      });
    },
    validMessage: () => true,
    integrateMessage: async message => {
      console.log('Integrating message', message);
      const TRANSFER_TOKEN = 'transferToken';
      if (message.type === TRANSFER_TOKEN) {
        const { tokenId, toId: nodeId } = message;
        await update('tokens', tokenId, {
          nodeId,
        });
      } else throw new Error(`Yo, message ${message.type} doesn't exist!`);

      if (await quorum()) await followEdge('startGame');

      return getAll();
    },
  };
}
