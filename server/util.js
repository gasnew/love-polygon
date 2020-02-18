// @flow

import _ from 'lodash';

import type {
  CrushSelections,
  Needs,
  Nodes,
  Relationships,
  ServerState,
  ServerStateKeys,
  SubServerState,
  Tokens,
} from './networkTypes';

export async function asyncArrayEach<Item>(
  items: Array<Item>,
  func: Item => any
): Promise<void> {
  for (const item of items) {
    await func(item);
  }
}

export async function asyncObjectEach<T: Object>(
  obj: T,
  func: ($Values<T>, $Keys<T>) => Promise<any>
): Promise<void> {
  for (const key of _.keys(obj)) {
    await func(obj[key], key);
  }
}

export function getPlayerNodes(nodes: Nodes, playerId: string): Nodes {
  return _.pickBy(
    nodes,
    node => _.includes(node.playerIds, playerId) && node.type === 'storage'
  );
}

export function getPlayerTokens(
  nodes: Nodes,
  tokens: Tokens,
  playerId: string
): Tokens {
  const playerNodes = getPlayerNodes(nodes, playerId);
  return _.pickBy(tokens, token => playerNodes[token.nodeId]);
}

type PointCriteria = {
  needsMet: boolean,
  guessedCrushesCorrectly: boolean,
  secretLove: boolean,
};

export function getPointCriteria({
  crushSelections,
  nodes,
  relationships,
  tokens,
  needs,
  playerId,
}: {
  crushSelections: CrushSelections,
  nodes: Nodes,
  relationships: Relationships,
  tokens: Tokens,
  needs: Needs,
  playerId: string,
}): PointCriteria {
  const getNeedsMet = (playerId: string): boolean => {
    const playerNodes = getPlayerNodes(nodes, playerId);
    const storedTokens = _.pickBy(
      getPlayerTokens(nodes, tokens, playerId),
      token => playerNodes[token.nodeId].type === 'storage'
    );
    const need = _.find(needs, ['playerId', playerId]) || {};
    return _.filter(storedTokens, ['type', need.type]).length >= need.count;
  };

  const getGuessedCrushesCorrectly = (playerId: string): boolean => {
    const crushes = _.map(
      _.filter(
        relationships,
        ({ type, toId }) => type === 'crush' && toId === playerId
      ),
      'fromId'
    );
    const guesses = (_.find(crushSelections, ['playerId', playerId]) || {})
      .playerIds;

    return _.isEqual(_.sortBy(crushes), _.sortBy(guesses));
  };

  const getSecretLove = (playerId: string): boolean => {
    const getPlayerRelationship = playerId =>
      _.find(relationships, ['fromId', playerId]);
    const relationship = getPlayerRelationship(playerId);
    const objectId =
      relationship.type === 'crush'
        ? relationship.toId
        : getPlayerRelationship(relationship.toId).toId;
    return getNeedsMet(objectId) && !getGuessedCrushesCorrectly(objectId);
  };

  return {
    needsMet: getNeedsMet(playerId),
    guessedCrushesCorrectly: getGuessedCrushesCorrectly(playerId),
    secretLove: getSecretLove(playerId),
  };
}
