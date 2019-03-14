// @flow

import redis from 'async-redis';
import _ from 'lodash';
import uniqid from 'uniqid';

import withEvents from './events';
import getFollowEdge from './phase';
import { getNewPlayerState } from './states';
import type { Emitter } from './events';

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

type BaseSession = {|
  ...RedisMethods,
  update: (ServerStateKeys, SubServerState, ?SubServerState) => Promise<void>,
  updateAll: ServerState => Promise<void>,
|};

export type BaseSessionProps = {
  id: string,
};

export function getBaseSession({ id }: BaseSessionProps): BaseSession {
  const redisClient = redis.createClient();
  redisClient.on('error', function(err) {
    console.log('Error ' + err);
  });

  const { getAll, set } = redisMethods(redisClient, id);
  const update = async (
    key: ServerStateKeys,
    objects: SubServerState,
    subState: ?SubServerState = null
  ) => {
    const currentObjects = subState || (await getAll())[key];
    const updatedObjects = _.reduce(
      objects,
      (allObjects, object, id) => ({
        ...allObjects,
        [id]: {
          ...currentObjects[id],
          ...object,
        },
      }),
      {}
    );
    set(key, {
      ...currentObjects,
      ...updatedObjects,
    });
  };
  const updateAll = async (serverState: ServerState) => {
    const currentServerState = await getAll();
    _.each(
      serverState,
      async (objects, key) =>
        await update(key, objects, currentServerState[key])
    );
  };

  return {
    getAll,
    set,
    update,
    updateAll,
  };
}

type Session = {
  ...BaseSessionProps,
  exists: () => Promise<boolean>,
  init: () => Promise<void>,
  join: ({ playerId: string, playerName: string }) => Promise<void>,
  validMessage: Message => boolean,
  integrateMessage: Message => Promise<ServerState>,
};

type SessionProps = BaseSessionProps & { emit: Emitter };

function getSession({ id, emit }: SessionProps): Session {
  const { getAll, set, update, updateAll } = getBaseSession({ id });

  const getPhaseName = async () => (await getAll()).phase.name;
  const setPhaseName = (name: PhaseName) => set('phase', { name });
  const startGame = async () => {
    const { players } = await getAll();
    await set('tokens', {});
    emit('changePhase');
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
      const playersData = sessionData.players;
      if (playersData[playerId]) {
        await update('players', { [playerId]: { active: true } });
        return;
      }
      await updateAll(getNewPlayerState({ playerId, playerName }));
    },
    validMessage: () => true,
    integrateMessage: async message => {
      console.log('Integrating message', message);
      const TRANSFER_TOKEN = 'transferToken';
      if (message.type === TRANSFER_TOKEN) {
        const { tokenId, toId: nodeId } = message;
        await update('tokens', {
          [tokenId]: {
            nodeId,
          },
        });
      } else throw new Error(`Yo, message ${message.type} doesn't exist!`);

      if (await quorum()) await followEdge('startGame');

      return getAll();
    },
  };
}

export default withEvents<BaseSessionProps>(getSession);
