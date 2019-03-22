// @flow

import _ from 'lodash';
import uniqid from 'uniqid';

import type {
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
  const nodeId1 = uniqid();
  const nodeId2 = uniqid();
  const tokenId = uniqid();
  return {
    players: {
      [playerId]: {
        id: playerId,
        name: playerName,
        active: true,
      },
    },
    nodes: {
      [nodeId1]: {
        id: nodeId1,
        playerIds: [playerId],
        type: 'storage',
      },
      [nodeId2]: {
        id: nodeId2,
        playerIds: [playerId],
        type: 'loveBucket',
      },
    },
    tokens: {
      [tokenId]: {
        id: tokenId,
        nodeId: nodeId1,
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
  if (numberOfPlayers <= 2) return 1;
  if (numberOfPlayers === 3) return _.random(1, 3);
  if (numberOfPlayers === 4) return _.random(2, 4);
  throw new Error(`${numberOfPlayers} players is not supported!`);
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
  type: RelationshipType
): Relationships {
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
            toId: _.shuffle(targetPlayers)[0].id,
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
  const storageNodes = _.reduce(
    players,
    (storageNodes, player, playerId) => {
      return {
        ...storageNodes,
        ..._.reduce(
          _.range(4),
          nodes => {
            const nodeId = uniqid();
            return {
              ...nodes,
              [nodeId]: {
                id: nodeId,
                playerIds: [playerId],
                type: 'storage',
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
  const tokens = _.reduce(
    nodesByPlayer,
    (allTokens, nodes) => ({
      ...allTokens,
      ..._.reduce(
        nodes.slice(0, -1),
        (playerTokens, node) => {
          const tokenId = uniqid();
          return {
            ...playerTokens,
            [tokenId]: {
              id: tokenId,
              nodeId: node.id,
            },
          };
        },
        {}
      ),
    }),
    {}
  );

  const { lovers, wingmen } = getRoles(
    players,
    getNumberOfLovers(_.size(players))
  );
  const crushRelationships = buildRelationships(lovers, players, 'crush');
  const wingmanRelationships = buildRelationships(wingmen, lovers, 'wingman');

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
  };
}
