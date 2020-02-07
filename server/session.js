// @flow

import redis from 'async-redis';
import _ from 'lodash';
import uniqid from 'uniqid';
import type { RedisClient } from 'async-redis';

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

export function sessionExists(
  redisClient: RedisClient,
  sessionId: string
): Promise<boolean> {
  return redisClient.exists(sessionId);
}

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
  deleteObjects: (
    ServerStateKeys,
    string | string[],
    ?SubServerState
  ) => Promise<void>,
|};

export type BaseSessionProps = {
  id: string,
  redisClient: RedisClient,
};

export function getBaseSession({
  id,
  redisClient,
}: BaseSessionProps): BaseSession {
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
  const deleteObjects = async (
    key: ServerStateKeys,
    id: string | string[],
    subState: ?SubServerState = null
  ) => {
    const currentObjects = subState || (await getAll())[key];
    set(key, _.omit(currentObjects, id));
  };

  return {
    getAll,
    set,
    update,
    updateAll,
    deleteObjects,
  };
}

type Session = {
  ...BaseSessionProps,
  isInitialized: () => Promise<boolean>,
  init: () => Promise<void>,
  join: ({ playerId: string, playerName: string }) => Promise<void>,
  validMessage: (ServerState, Message) => boolean,
  integrateMessage: (ServerState, Message) => Promise<ServerState>,
};

type SessionProps = BaseSessionProps & { emit: Emitter };

function getSession({ id, redisClient, emit }: SessionProps): Session {
  const { deleteObjects, getAll, set, update, updateAll } = getBaseSession({
    id,
    redisClient,
  });

  const getPhaseName = async () => (await getAll()).phase.name;
  const setPhaseName = (name: PhaseName) => set('phase', { name });
  const startGame = async () => {
    const serverState = await getAll();
    const readyPlayers = _.flow(
      nodes => _.pickBy(nodes, ['type', 'loveBucket']),
      loveBuckets =>
        _.filter(serverState.tokens, token => loveBuckets[token.nodeId]),
      readyTokens =>
        _.map(
          readyTokens,
          token => serverState.nodes[token.nodeId].playerIds[0]
        ),
      playerIds => _.pick(serverState.players, playerIds)
    )(serverState.nodes);
    await update(
      'players',
      _.reduce(
        readyPlayers,
        (players, player) => ({
          ...players,
          [player.id]: { inRound: true },
        }),
        {}
      )
    );

    const nodesToDelete = _.filter(serverState.nodes, node =>
      _.includes(_.map(readyPlayers, 'id'), node.playerIds[0])
    );
    const tokensToDelete = _.filter(serverState.tokens, token =>
      _.some(nodesToDelete, ['id', token.nodeId])
    );
    await deleteObjects('nodes', _.map(nodesToDelete, 'id'), serverState.nodes);
    await deleteObjects(
      'tokens',
      _.map(tokensToDelete, 'id'),
      serverState.tokens
    );

    try {
      await updateAll(getRomanceState({ players: readyPlayers }));
    } catch (error) {
      console.log('WHOOPS! Try, try again');
      await updateAll(getRomanceState({ players: readyPlayers }));
    }
    console.log('start game now');
    emit('changePhase');
  };
  const startCountdown = async () => {
    console.log('start countdown');
    // TODO(gnewman): Reimplement this countdown timer to be more robust
    // Add 0.5 seconds to account for latency
    setTimeout(async () => await endGame(), 15500);
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
    const playersInRound = _.pickBy(players, 'inRound');
    const roundEnder = roundEnderOrNone || _.sample(playersInRound);
    const otherPlayers = _.reject(playersInRound, ['id', roundEnder]);
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
    const { nodes, tokens } = serverState;
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
    const { nodes, players } = await getAll();
    await update('nodes', {
      ..._.reduce(
        _.filter(nodes, node => players[node.playerIds[0]].inRound),
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
    deleteObjects,
    getAll,
    set,
    update,
    isInitialized: async () => (await getAll()).phase !== undefined,
    init: async () => {
      await setPhaseName('lobby');
      await set('players', {});
      await set('needs', {});
      await set('nodes', {});
      await set('tokens', {});
      await set('relationships', {});
      await set('crushSelections', {});
      await set('partyLeader', null);
      await set('roundEnder', null);
      await set('currentVoter', null);
    },
    join: async ({ playerId }) => {
      const sessionData = await getAll();
      const playersData = sessionData.players;
      if (playersData[playerId]) {
        await update('players', { [playerId]: { active: true } });
        return;
      }
      await updateAll(getNewPlayerState({ playerId }));
    },
    validMessage: (serverState: ServerState, message: Message): boolean => {
      if (message.type === 'setName') {
        const { playerId } = message;
        const { players, nodes, tokens } = serverState;
        const loveBucket = _.find(
          nodes,
          node =>
            _.includes(node.playerIds, playerId) && node.type === 'loveBucket'
        );
        if (!loveBucket) return false;

        const heartIsInBucket = _.some(tokens, ['nodeId', loveBucket.id]);
        if (heartIsInBucket) return false;
        return true;
      } else if (message.type === 'startGame') {
        if (message.playerId !== serverState.partyLeader) return false;
        return quorum(serverState);
      } else if (message.type === 'transferToken') {
        const { tokenId, fromId, toId } = message;
        const { nodes, tokens } = serverState;
        const token = tokens[tokenId];
        const fromNode = nodes[fromId];
        const toNode = nodes[toId];
        if (!token || !fromNode || !toNode) return false;
        if (!fromNode.enabled || !toNode.enabled) return false;
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
      if (message.type === 'setName') {
        const { name, playerId } = message;
        const { players, nodes, tokens } = serverState;
        const player = _.find(players, ['id', message.playerId]);
        const loveBucket = _.find(
          nodes,
          node =>
            _.includes(node.playerIds, playerId) && node.type === 'loveBucket'
        );

        await update('players', { [playerId]: { name } });
        if (name === '')
          await update('nodes', { [loveBucket.id]: { enabled: false } });
        else await update('nodes', { [loveBucket.id]: { enabled: true } });
      } else if (message.type === 'startGame') {
        await followEdge('startGame');
      } else if (message.type === 'transferToken') {
        const { tokenId, fromId, toId } = message;
        const { nodes, partyLeader } = serverState;
        await update('tokens', {
          [tokenId]: {
            nodeId: toId,
          },
        });

        // Check for setting party leader
        const toNode = nodes[toId];
        const fromNode = nodes[fromId];
        if (toNode.type === 'loveBucket' && !partyLeader)
          await set('partyLeader', toNode.playerIds[0]);
        else if (
          fromNode.type === 'loveBucket' &&
          fromNode.playerIds[0] === partyLeader
        )
          await set('partyLeader', null);
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
