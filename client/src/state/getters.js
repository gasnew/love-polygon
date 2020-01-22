// @flow

import _ from 'lodash';

import type { Socket } from 'socket.io-client';

import type {
  CrushSelection,
  CrushSelections,
  Phase,
  SessionInfo,
} from '../../../server/networkTypes';
import type {
  Need,
  Needs,
  Node,
  Nodes,
  Player,
  Players,
  Relationship,
  Relationships,
  State,
  Token,
  Tokens,
} from './state';

export function getState(): State {
  return window.state;
}

export function getPhase(): ?Phase {
  return getState().phase;
}

export function getSessionInfo(): SessionInfo {
  return getState().sessionInfo;
}

export function getSocket(): ?Socket {
  return getState().socket;
}

export function getCurrentTokenId(): ?string {
  return getState().currentTokenId;
}

export function getPartyLeader(): string {
  return getState().partyLeader;
}

export function getCurrentVoter(): ?string {
  return getState().currentVoter;
}

export function getPlayers(): Players {
  return getState().players;
}

export function getPlayer(playerId: string): Player {
  return getPlayers()[playerId];
}

export function getNodes(): Nodes {
  return getState().nodes;
}

export function getNode(nodeId: string): Node {
  return getNodes()[nodeId];
}

export function getOwnNodes(): Nodes {
  const { playerId } = getSessionInfo();
  return _.pickBy(getNodes(), node => _.includes(node.playerIds, playerId));
}

export function getTokens(): Tokens {
  return getState().tokens;
}

export function getToken(tokenId: string): Token {
  return getTokens()[tokenId];
}

export function getNodeToken(nodeId: string): ?Token {
  return _.find(getTokens(), ['nodeId', nodeId]);
}

export function getOwnTokens(): Tokens {
  const nodes = getOwnNodes();
  return _.pickBy(getTokens(), token => nodes[token.nodeId]);
}

export function getRelationships(): Relationships {
  return getState().relationships;
}

export function getPlayerRelationship(playerId: string): Relationship {
  return _.find(getRelationships(), ['fromId', playerId]);
}

export function getOwnRelationship(): Relationship {
  const { playerId } = getSessionInfo();
  return getPlayerRelationship(playerId);
}

export function getNeeds(): Needs {
  return getState().needs;
}

export function getOwnNeed(): Need {
  const { playerId } = getSessionInfo();
  return _.find(getNeeds(), ['playerId', playerId]);
}

export function getCrushSelections(): CrushSelections {
  return getState().crushSelections;
}

export function getPlayerCrushSelection(playerId: string): CrushSelection {
  return _.find(getCrushSelections(), ['playerId', playerId]);
}

export function getVotingOrder(): string[] {
  return getState().votingOrder;
}

export function getGuessedCrushesCorrectly(playerId: string): boolean {
  const crushes = _.map(
    _.filter(
      getRelationships(),
      ({ type, toId }) => type === 'crush' && toId === playerId
    ),
    'fromId'
  );
  const guesses = getPlayerCrushSelection(playerId).playerIds;

  return _.isEqual(_.sortBy(crushes), _.sortBy(guesses));
}
