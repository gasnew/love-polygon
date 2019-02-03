// @flow

import type { Dimensions, State, Token, Tokens } from './state';

export function getState(): State {
  return window.state;
}

export function getStageDimensions(): Dimensions {
  return getState().stage;
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
