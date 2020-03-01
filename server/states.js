// @flow

import _ from 'lodash';
import randomColor from 'randomcolor';
import uniqid from 'uniqid';

import type {
  CrushSelections,
  Needs,
  Nodes,
  Player,
  Players,
  Relationships,
  RelationshipType,
  ServerState,
  TrueLoveSelections,
  Tokens,
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
        inRound: false,
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
        enabled: false,
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

type TableStateProps = {
  players: Players,
};

function getTableState({ players }: TableStateProps): $Shape<ServerState> {
  const TOKEN_TYPES = ['cookie', 'cake', 'candy'];
  const NODE_COUNT = 4;

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
          count: 4,
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
        ..._.map(_.range(NODE_COUNT), () => need.type),
      ],
      []
    ),
    //..._.map(players, () => _.sample(TOKEN_TYPES)),
  ]);
  const typesWithNodes = _.zip(
    tokensAsTypes,
    _.flatMap(_.values(nodesByPlayer))
    //_.flatMap(nodesByPlayer, playerNodes => playerNodes.slice(0, -1))
  );

  const tokens = _.reduce(
    typesWithNodes,
    (playerTokens, [type, node]) => {
      const tokenId = uniqid();
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

  const trueLoveSelections = _.reduce(
    players,
    (trueLoveSelections, player) => {
      const id = uniqid();
      return {
        ...trueLoveSelections,
        [id]: {
          id,
          playerId: player.id,
          player1Id: null,
          player2Id: null,
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
    needs,
    votingOrder: [],
    crushSelections,
    trueLoveSelections,
  };
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
  const playerIds = _.keys(players);
  const loverIds = _.shuffle(playerIds).slice(0, numberOfLovers);
  const wingmenIds = _.difference(playerIds, loverIds);

  return {
    lovers: _.pick(players, loverIds),
    wingmen: _.pick(players, wingmenIds),
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
            toId: _.sample(
              filterTargets(
                _.reject(targetPlayers, ['id', sourcePlayer.id]),
                sourcePlayer
              )
            ).id,
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
    relationships: {
      ...crushRelationships,
      ...wingmanRelationships,
    },
    ...getTableState({ players }),
  };
}

export function getTrueLoveState({
  players,
}: RomanceStateProps): $Shape<ServerState> {
  const crush = (fromId: string, toId: string): Relationships =>
    _.flow(id => ({
      [id]: {
        id,
        type: 'crush',
        fromId,
        toId,
      },
    }))(uniqid());
  const crushesOn = (relationships, target) => source =>
    _.flow(sourceCrush => sourceCrush && sourceCrush.toId === target.id)(
      _.find(relationships, ['fromId', source.id])
    );

  const { lovers, wingmen } = getRoles(
    players,
    getNumberOfLovers(_.size(players))
  );
  const lover1 = _.sample(lovers);
  const lover2 = _.sample(_.reject(lovers, ['id', lover1.id]));
  const trueLoveRelationships = {
    ...crush(lover1.id, lover2.id),
    ...crush(lover2.id, lover1.id),
  };

  // Can't have any other reciprocal crush relationships!
  const crushRelationships = _.reduce(
    _.reject(lovers, lover => lover.id === lover1.id || lover.id === lover2.id),
    (crushRelationships, lover) => ({
      ...crushRelationships,
      ...crush(
        lover.id,
        _.flow(
          players => _.reject(players, ['id', lover.id]),
          otherPlayers =>
            _.reject(otherPlayers, crushesOn(crushRelationships, lover)),
          _.sample
        )(players).id
      ),
    }),
    {}
  );

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
    relationships: {
      ...trueLoveRelationships,
      ...crushRelationships,
      ...wingmanRelationships,
    },
    ...getTableState({ players }),
  };
}

type RomanceCleanupProps = {
  players: Players,
  nodes: Nodes,
  tokens: Tokens,
  relationships: Relationships,
  needs: Needs,
  crushSelections: CrushSelections,
  trueLoveSelections: TrueLoveSelections,
};

export function getRomanceCleanup({
  players,
  nodes,
  tokens,
  relationships,
  needs,
  crushSelections,
  trueLoveSelections,
}: RomanceCleanupProps): $Shape<ServerState> {
  const participatingPlayers = _.pickBy(players, 'inRound');
  const nodesToDelete = _.pickBy(nodes, node =>
    _.includes(_.map(participatingPlayers, 'id'), node.playerIds[0])
  );
  const tokensToDelete = _.pickBy(tokens, token => nodes[token.nodeId]);

  return {
    nodes: nodesToDelete,
    tokens: tokensToDelete,
    relationships,
    needs,
    crushSelections,
    trueLoveSelections,
  };
}
