// @flow

import _ from 'lodash';

import type { Socket } from 'socket.io-client';

import type { Phase, SessionInfo } from '../../../server/networkTypes';
import type {
  Dimensions,
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

export function getSelectedPlayers(): string[] {
  return getState().selectedPlayers;
}

export function getVotingOrder(): string[] {
  return getState().votingOrder;
}
