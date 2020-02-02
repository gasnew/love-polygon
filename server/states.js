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
};

export function getNewPlayerState({
  playerId,
}: NewPlayerStateProps): $Shape<ServerState> {
  const color = randomColor();
  const nodeId1 = uniqid();
  const nodeId2 = uniqid();
  const tokenId = uniqid();
  return {
    players: {
      [playerId]: {
        id: playerId,
        name: '',
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
  if (numberOfPlayers === 3) return 3;
  if (numberOfPlayers === 4) return 3;
  if (numberOfPlayers === 5) return 3;
  if (numberOfPlayers === 6) return 4;
  if (numberOfPlayers === 7) return 5;
  if (numberOfPlayers === 8) return 5;
  throw new Error('Whoa!! Too many folks for love. Let me breathe the air');
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
  const NODE_COUNT = 3;

  const storageNodes = _.reduce(
    players,
    (storageNodes, player, playerId) => {
      return {
        ...storageNodes,
        ..._.reduce(
          _.range(NODE_COUNT),
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

  const tokensAsTypes = _.shuffle([
    ..._.reduce(
      needs,
      (needTypes, need) => [
        ...needTypes,
        ..._.map(_.range(3), () => need.type),
      ],
      []
    ),
    //..._.map(players, () => _.sample(TOKEN_TYPES)),
  ]);
  console.log(nodesByPlayer);
  console.log(_.values(nodesByPlayer));
  const typesWithNodes = _.zip(
    tokensAsTypes,
    _.flatMap(_.values(nodesByPlayer))
    //_.flatMap(nodesByPlayer, playerNodes => playerNodes.slice(0, -1))
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

  const crushSelections = _.reduce(
    players,
    (crushSelections, player) => {
      const id = uniqid();
      return {
        ...crushSelections,
        [id]: {
          id,
          playerId: player.id,
          playerIds: [],
          finalized: false,
        },
      };
    },
    {}
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
    crushSelections,
  };
}
