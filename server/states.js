// @flow

import _ from 'lodash';
import randomColor from 'randomcolor';
import uniqid from 'uniqid';

import type {
  Player,
  Players,
  Relationships,
  RelationshipType,
  ServerState,
} from './networkTypes';

type NewPlayerStateProps = {
  playerId: string,
  playerName: string,
};

export function getNewPlayerState({
  playerId,
  playerName,
}: NewPlayerStateProps): $Shape<ServerState> {
  const color = randomColor();
  const nodeId1 = uniqid();
  const nodeId2 = uniqid();
  const tokenId = uniqid();
  return {
    players: {
      [playerId]: {
        id: playerId,
        name: playerName,
        color,
        active: true,
      },
    },
    nodes: {
      [nodeId1]: {
        id: nodeId1,
        playerIds: [playerId],
        type: 'storage',
        enabled: true,
      },
      [nodeId2]: {
        id: nodeId2,
        playerIds: [playerId],
        type: 'loveBucket',
        enabled: true,
      },
    },
    tokens: {
      [tokenId]: {
        id: tokenId,
        nodeId: nodeId1,
        type: 'heart',
      },
    },
  };
}

export function pairs<T>(array: T[]): T[][] {
  if (!array.length) return [];
  return _.reduce(
    array.slice(1),
    (combos, element) => [...combos, [array[0], element]],
    []
  ).concat(pairs(array.slice(1)));
}

export const getNumberOfLovers = (numberOfPlayers: number): number => {
  if (numberOfPlayers <= 2) throw new Error('Nah, man! Too few folks for love');
  if (numberOfPlayers === 3) 3;
  if (numberOfPlayers === 4) return _.random(2, 4);
  return _.random(Math.round(numberOfPlayers * 0.3), numberOfPlayers);
};

type Roles = {
  lovers: Players,
  wingmen: Players,
};

export function getRoles(players: Players, numberOfLovers: number): Roles {
  const inIds = ids => player => _.includes(ids, player.id);

  const loverIds = _.shuffle(_.keys(players)).slice(0, numberOfLovers);
  const wingmenIds = _.difference(_.keys(players), loverIds);

  return {
    lovers: _.pickBy(players, inIds(loverIds)),
    wingmen: _.pickBy(players, inIds(wingmenIds)),
  };
}
export function buildRelationships(
  sourcePlayers: Players,
  targetPlayers: Players,
  type: RelationshipType,
  filterTargets: (Player[], Player) => Player[] = (a, b) => _.values(a)
): Relationships {
  //console.log(sourcePlayers);
  //console.log(targetPlayers);
  //console.log(type);
  return {
    ..._.reduce(
      sourcePlayers,
      (relationships, sourcePlayer) => {
        const relationshipId = uniqid();
        return {
          ...relationships,
          [relationshipId]: {
            id: relationshipId,
            type,
            fromId: sourcePlayer.id,
            toId: _.shuffle(
              filterTargets(
                _.reject(targetPlayers, ['id', sourcePlayer.id]),
                sourcePlayer
              )
            )[0].id,
          },
        };
      },
      {}
    ),
  };
}

type RomanceStateProps = {
  players: Players,
};

export function getRomanceState({
  players,
}: RomanceStateProps): $Shape<ServerState> {
  const TOKEN_TYPES = ['cookie', 'cake', 'candy'];

  const storageNodes = _.reduce(
    players,
    (storageNodes, player, playerId) => {
      return {
        ...storageNodes,
        ..._.reduce(
          _.range(5),
          nodes => {
            const nodeId = uniqid();
            return {
              ...nodes,
              [nodeId]: {
                id: nodeId,
                playerIds: [playerId],
                type: 'storage',
                enabled: true,
              },
            };
          },
          {}
        ),
      };
    },
    {}
  );

  const playerPairs = pairs(_.values(players));
  const sharedNodes = _.reduce(
    playerPairs,
    (sharedNodes, [{ id: id1 }, { id: id2 }]) => {
      const nodeId = uniqid();
      return {
        ...sharedNodes,
        [nodeId]: {
          id: nodeId,
          playerIds: [id1, id2],
          type: 'shared',
          enabled: true,
        },
      };
    },
    {}
  );

  const needs = _.reduce(
    players,
    (needs, player) => {
      const needId = uniqid();
      return {
        ...needs,
        [needId]: {
          id: needId,
          playerId: player.id,
          type: _.sample(TOKEN_TYPES),
          count: 3,
        },
      };
    },
    {}
  );

  const playerNodes = (nodes, playerId) =>
    _.filter(nodes, node => _.includes(node.playerIds, playerId));
  const nodesByPlayer = _.reduce(
    players,
    (nodesByPlayer, player, playerId) => ({
      ...nodesByPlayer,
      [playerId]: playerNodes(storageNodes, playerId),
    }),
    {}
  );

  const typesOfTokens = _.shuffle([
    ..._.reduce(
      needs,
      (needTypes, need) => [
        ...needTypes,
        ..._.map(_.range(3), () => need.type),
      ],
      []
    ),
    ..._.map(players, () => _.sample(TOKEN_TYPES)),
  ]);
  const typesWithNodes = _.zip(
    typesOfTokens,
    _.flatMap(nodesByPlayer, playerNodes => playerNodes.slice(0, -1))
  );

  const tokens = _.reduce(
    typesWithNodes,
    (playerTokens, [type, node]) => {
      const tokenId = uniqid();
      console.log(type);
      return {
        ...playerTokens,
        [tokenId]: {
          id: tokenId,
          nodeId: node.id,
          type,
        },
      };
    },
    {}
  );

  const { lovers, wingmen } = getRoles(
    players,
    getNumberOfLovers(_.size(players))
  );
  const crushRelationships = buildRelationships(lovers, players, 'crush');
  const wingmanRelationships = buildRelationships(
    wingmen,
    lovers,
    'wingman',
    (lovers, wingman) =>
      _.reject(lovers, lover =>
        _.some(
          crushRelationships,
          crush => crush.fromId === lover.id && crush.toId === wingman.id
        )
      )
  );

  return {
    nodes: {
      ...storageNodes,
      ...sharedNodes,
    },
    tokens,
    relationships: {
      ...crushRelationships,
      ...wingmanRelationships,
    },
    needs,
    votingOrder: [],
    currentVoter: null,
    selectedPlayers: [],
    roundEnder: null,
  };
}
