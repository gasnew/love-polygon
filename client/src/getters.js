// @flow

import type { Dimensions, State, Token, Tokens } from './state';

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

export function getCurrentTokenId(): ?string {
  return getState().currentTokenId;
}

export function getTokens(): Tokens {
  return getState().tokens;
}

export function getToken(tokenId: string): Token {
  return getTokens()[tokenId];
}
