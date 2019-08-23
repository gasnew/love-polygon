// @flow

import redis from 'async-redis';
import _ from 'lodash';
import uniqid from 'uniqid';

import withEvents from './events';
import getFollowEdge from './phase';
import { getNewPlayerState, getRomanceState } from './states';
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
  validMessage: (ServerState, Message) => boolean,
  integrateMessage: (ServerState, Message) => Promise<ServerState>,
};

type SessionProps = BaseSessionProps & { emit: Emitter };

function getSession({ id, emit }: SessionProps): Session {
  const { getAll, set, update, updateAll } = getBaseSession({ id });

  const getPhaseName = async () => (await getAll()).phase.name;
  const setPhaseName = (name: PhaseName) => set('phase', { name });
  const startGame = async () => {
    await set('nodes', {});
    await set('tokens', {});
    try {
      await updateAll(getRomanceState(await getAll()));
    } catch(error) {
      console.log('WHOOPS! Try, try again');
      await updateAll(getRomanceState(await getAll()));
    }
    console.log('start game now');
    emit('changePhase');
  };
  const startCountdown = async () => {
    console.log('start countdown');
    emit('changePhase');
  };
  const finishGame = async () => {
    console.log('finish game');
    emit('changePhase');
  };

  const followEdge = getFollowEdge({
    getPhaseName,
    setPhaseName,
    startGame,
    startCountdown,
    finishGame,
  });

  const quorum = async (): Promise<boolean> => {
    const { nodes, players, tokens } = await getAll();
    const loveBuckets = _.pickBy(nodes, ['type', 'loveBucket']);
    // TODO remove this temp quorum definition
    //return _.size(players) >= 1;
    return _.filter(tokens, token => loveBuckets[token.nodeId]).length >= 3;
  };
  const getPlayerTokens = (nodes, tokens, playerId) => {
    const playerNodes = _.pickBy(
      nodes,
      node => _.includes(node.playerIds, playerId) && node.type === 'storage'
    );
    return _.pickBy(tokens, token => playerNodes[token.nodeId]);
  };
  const endGame = async () => {
    const { nodes } = await getAll();
    await update('nodes', {
      ..._.reduce(
        nodes,
        (disabledNodes, node) => ({
          ...disabledNodes,
          [node.id]: {
            ...node,
            enabled: false,
          },
        }),
        {}
      ),
    });
    await followEdge('reallyFinish');
  };

  return {
    getAll,
    set,
    update,
    exists: async () => (await getAll()).phase !== undefined,
    init: async () => {
      await setPhaseName('lobby');
      await set('players', {});
      await set('needs', {});
      await set('nodes', {});
      await set('tokens', {});
      await set('relationships', {});
    },
    join: async ({ playerId, playerName }) => {
      // TODO: REMOVEME
      //const pid1 = uniqid();
      //const pid2 = uniqid();
      //await updateAll(getNewPlayerState({ playerId: pid1, playerName: pid1 }))
      //await updateAll(getNewPlayerState({ playerId: pid2, playerName: pid2 }))

      const sessionData = await getAll();
      const playersData = sessionData.players;
      if (playersData[playerId]) {
        await update('players', { [playerId]: { active: true } });
        return;
      }
      await updateAll(getNewPlayerState({ playerId, playerName }));
    },
    validMessage: (serverState: ServerState, message: Message): boolean => {
      if (message.type === 'transferToken') {
        const { tokenId, fromId, toId } = message;
        const { nodes, tokens } = serverState;
        const token = tokens[tokenId];
        const fromNode = nodes[fromId];
        const toNode = nodes[toId];
        if (!token || !fromNode || !toNode) return false;
        if (!fromNode.enabled) return false;
        if (token.nodeId !== fromId) return false;
        if (_.some(tokens, ['nodeId', toId])) return false;

        return true;
      } else if (message.type === 'finishRound') {
        const { playerId } = message;
        const { needs, nodes, tokens } = serverState;
        const playerTokens = getPlayerTokens(nodes, tokens, playerId);
        const need = _.find(needs, ['playerId', playerId]);

        return (
          _.filter(playerTokens, ['type', need.type]).length >= need.count
        );
      }

      return false;
    },
    integrateMessage: async (serverState, message) => {
      console.log('Integrating message', message);
      if (message.type === 'transferToken') {
        const { tokenId, toId: nodeId } = message;
        await update('tokens', {
          [tokenId]: {
            nodeId,
          },
        });
      } else if (message.type === 'finishRound') {
        const { playerId } = message;
        const { needs, nodes, tokens } = serverState;
        const need = _.find(needs, ['playerId', playerId]);
        const nodesToDisable = _.filter(
          nodes,
          node =>
            _.includes(node.playerIds, playerId) &&
            node.type === 'storage' &&
            (_.find(tokens, ['nodeId', node.id]) || {}).type === need.type
        ).slice(0, need.count);
        await update('nodes', {
          ..._.reduce(
            nodesToDisable,
            (disabledNodes, node) => ({
              ...disabledNodes,
              [node.id]: {
                ...node,
                enabled: false,
              },
            }),
            {}
          ),
        });

        await followEdge('finishGame');
        setTimeout(async () => await endGame(), 15000);
      } else throw new Error(`Yo, message ${message.type} doesn't exist!`);

      if (await quorum()) await followEdge('startGame');

      return getAll();
    },
  };
}

export default withEvents<BaseSessionProps>(getSession);
