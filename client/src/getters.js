// @flow

import _ from 'lodash';

import type Socket from 'socket.io-client';

import type { SessionInfo } from '../../server/networkTypes';
import type {
  Dimensions,
  Node,
  Nodes,
  Player,
  Players,
  State,
  Token,
  Tokens,
} from './state';

export function getState(): State {
  return window.state;
}

export function getSessionInfo(): SessionInfo {
  return getState().sessionInfo;
}

export function getStageDimensions(): Dimensions {
  // NOTE: This one is secretly not in state. Shhhh
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

export function getSocket(): ?Socket {
  return getState().socket;
}

export function getCurrentTokenId(): ?string {
  return getState().currentTokenId;
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
  return _.pickBy(getNodes(), ['playerId', playerId]);
}

export function getTokens(): Tokens {
  return getState().tokens;
}

export function getToken(tokenId: string): Token {
  return getTokens()[tokenId];
}

export function getOwnTokens(): Tokens {
  const nodes = getOwnNodes();
  return _.pickBy(getTokens(), token => nodes[token.nodeId]);
}
