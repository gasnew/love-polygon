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
    } catch (error) {
      console.log('WHOOPS! Try, try again');
      await updateAll(getRomanceState(await getAll()));
    }
    console.log('start game now');
    emit('changePhase');
  };
  const startCountdown = async () => {
    console.log('start countdown');
    // TODO(gnewman): Reimplement this countdown timer to be more robust
    setTimeout(async () => await endGame(), 15000);
    emit('changePhase');
  };
  const finishGame = async () => {
    console.log('finish game');
    emit('changePhase');
    setTimeout(async () => {
      await setVotingOrder();
      await followEdge('startVoting');
    }, 2500);
  };
  const setVotingOrder = async () => {
    const { players, roundEnder: roundEnderOrNone } = await getAll();
    const roundEnder = roundEnderOrNone || _.sample(players);
    const otherPlayers = _.reject(players, ['id', roundEnder]);
    const votingOrder = [..._.shuffle(_.map(otherPlayers, 'id')), roundEnder];
    await set('votingOrder', votingOrder);
    await set('currentVoter', votingOrder[0]);
  };
  const startVoting = async () => {
    console.log('start voting');
    emit('changePhase');
  };
  const seeResults = async () => {
    console.log('see results');
    emit('changePhase');
  };

  const followEdge = getFollowEdge({
    getPhaseName,
    setPhaseName,
    buildGraph: transition => ({
      lobby: {
        startGame: transition('romance', startGame),
      },
      romance: {
        restart: transition('romance', startGame),
        startCountdown: transition('countdown', startCountdown),
      },
      countdown: {
        reallyFinish: transition('finished', finishGame),
      },
      finished: {
        startVoting: transition('voting', startVoting),
      },
      voting: {
        seeResults: transition('results', seeResults),
      },
    }),
  });

  const quorum = (serverState: ServerState): boolean => {
    const { nodes, players, tokens } = serverState;
    const loveBuckets = _.pickBy(nodes, ['type', 'loveBucket']);
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
    init: async playerId => {
      await setPhaseName('lobby');
      await set('players', {});
      await set('needs', {});
      await set('nodes', {});
      await set('tokens', {});
      await set('relationships', {});
      await set('crushSelections', {});
      await set('partyLeader', playerId);
      await set('roundEnder', null);
      await set('currentVoter', null);
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
      if (message.type === 'startGame') {
        if (message.playerId !== serverState.partyLeader) return false;
        return quorum(serverState);
      } else if (message.type === 'transferToken') {
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
      } else if (message.type === 'swapTokens') {
        const { tokenId1, nodeId1, tokenId2, nodeId2 } = message;
        const { nodes, tokens } = serverState;
        const token1 = tokens[tokenId1];
        const node1 = nodes[nodeId1];
        const token2 = tokens[tokenId2];
        const node2 = nodes[nodeId2];
        if (!token1 || !node1 || !token2 || !node2) return false;
        if (!node1.enabled || !node2.enabled) return false;
        if (token1.nodeId !== nodeId1) return false;
        if (token2.nodeId !== nodeId2) return false;

        return true;
      } else if (message.type === 'finishRound') {
        const { playerId } = message;
        const { needs, nodes, tokens, roundEnder } = serverState;
        const playerTokens = getPlayerTokens(nodes, tokens, playerId);
        const need = _.find(needs, ['playerId', playerId]);

        if (roundEnder) return false;

        return _.filter(playerTokens, ['type', need.type]).length >= need.count;
      } else if (message.type === 'selectPlayer') {
        const { sourcePlayerId, targetPlayerId } = message;
        const { currentVoter, crushSelections } = serverState;
        if (currentVoter !== sourcePlayerId) return false;

        const crushSelection = _.find(crushSelections, [
          'playerId',
          sourcePlayerId,
        ]);
        return !_.includes(crushSelection.playerIds, targetPlayerId);
      } else if (message.type === 'deselectPlayer') {
        const { sourcePlayerId, targetPlayerId } = message;
        const { currentVoter, crushSelections } = serverState;
        if (currentVoter !== sourcePlayerId) return false;

        const crushSelection = _.find(crushSelections, [
          'playerId',
          sourcePlayerId,
        ]);
        return _.includes(crushSelection.playerIds, message.targetPlayerId);
      } else if (message.type === 'seeResults') {
        return message.playerId === serverState.partyLeader;
      } else if (message.type === 'submitVotes') {
        return serverState.currentVoter === message.currentVoterId;
      }

      return false;
    },
    integrateMessage: async (serverState, message) => {
      console.log('Integrating message', message);
      if (message.type === 'startGame') {
        await followEdge('startGame');
      } else if (message.type === 'transferToken') {
        const { tokenId, toId: nodeId } = message;
        await update('tokens', {
          [tokenId]: {
            nodeId,
          },
        });
      } else if (message.type === 'swapTokens') {
        const { tokenId1, nodeId1, tokenId2, nodeId2 } = message;
        await update('tokens', {
          [tokenId1]: {
            nodeId: nodeId2,
          },
          [tokenId2]: {
            nodeId: nodeId1,
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
        await set('roundEnder', playerId);
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

        await followEdge('startCountdown');
      } else if (message.type === 'selectPlayer') {
        const { sourcePlayerId, targetPlayerId } = message;
        const { crushSelections } = serverState;

        const crushSelection = _.find(crushSelections, [
          'playerId',
          sourcePlayerId,
        ]);
        await update('crushSelections', {
          [crushSelection.id]: {
            ...crushSelection,
            playerIds: [...crushSelection.playerIds, targetPlayerId],
          },
        });
      } else if (message.type === 'deselectPlayer') {
        const { sourcePlayerId, targetPlayerId } = message;
        const { crushSelections } = serverState;

        const crushSelection = _.find(crushSelections, [
          'playerId',
          sourcePlayerId,
        ]);
        await update('crushSelections', {
          [crushSelection.id]: {
            ...crushSelection,
            playerIds: _.difference(crushSelection.playerIds, [targetPlayerId]),
          },
        });
      } else if (message.type === 'submitVotes') {
        const { currentVoterId } = message;
        const { crushSelections, votingOrder } = serverState;

        const crushSelection = _.find(crushSelections, [
          'playerId',
          currentVoterId,
        ]);
        await update('crushSelections', {
          [crushSelection.id]: {
            ...crushSelection,
            finalized: true,
          },
        });
        if (currentVoterId !== votingOrder[votingOrder.length - 1])
          await set(
            'currentVoter',
            votingOrder[votingOrder.indexOf(currentVoterId) + 1]
          );
      } else if (message.type === 'seeResults') {
        await followEdge('seeResults');
      } else throw new Error(`Yo, message ${message.type} doesn't exist!`);

      return getAll();
    },
  };
}

export default withEvents<BaseSessionProps>(getSession);
