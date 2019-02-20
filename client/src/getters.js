// @flow

import type Socket from 'socket.io-client';

import type { Dimensions, Node, Nodes, State, Token, Tokens } from './state';

export function getState(): State {
  return window.state;
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

export function getNodes(): Nodes {
  return getState().nodes;
}

export function getNode(nodeId: string): Node {
  return getNodes()[nodeId];
}

export function getTokens(): Tokens {
  return getState().tokens;
}

export function getToken(tokenId: string): Token {
  return getTokens()[tokenId];
}
