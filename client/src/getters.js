// @flow

import type { Dimensions, State, Tokens } from './state';

export function getState(): State {
  return window.state;
}

export function getStageDimensions(): Dimensions {
  return getState().stage;
}

export function getTokens(): Tokens {
  return getState().tokens;
}
