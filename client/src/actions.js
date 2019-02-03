// @flow

import { getState, getToken, getTokens } from './getters';
import type { Token } from './state';

const SET_TOKEN_POSITION = 'setTokenPosition';
const SET_CURRENT_TOKEN = 'setCurrentTokenId';

type Action =
  | {
      type: 'setTokenPosition',
      tokenId: string,
      x: number,
      y: number,
    }
  | {
      type: 'setCurrentTokenId',
      tokenId: ?string,
    };

const mergeIntoState = (key, subState) => {
  window.state = {
    ...getState(),
    [key]: subState,
  };
};

const mergeIntoTokens = (tokenId: string, token: Token) => {
  mergeIntoState('tokens', {
    ...getTokens(),
    [tokenId]: token,
  });
};

export function setTokenPosition(
  tokenId: string,
  x: number,
  y: number
): Action {
  return {
    type: SET_TOKEN_POSITION,
    tokenId,
    x,
    y,
  };
}

export function setCurrentTokenId(tokenId: ?string): Action {
  return {
    type: SET_CURRENT_TOKEN,
    tokenId,
  };
}

export default function dispatch(action: Action) {
  switch (action.type) {
    case SET_TOKEN_POSITION:
      mergeIntoTokens(action.tokenId, {
        ...getToken(action.tokenId),
        position: {
          x: action.x,
          y: action.y,
        },
      });
      break;
    case SET_CURRENT_TOKEN:
      mergeIntoState('currentTokenId', action.tokenId);
      break;
    default:
      throw new Error(`Yo, action ${action.type} doesn't exist!`);
  }
}
