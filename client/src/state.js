// @flow

export type Position = {
  x: number,
  y: number,
};

export type Dimensions = {
  width: number,
  height: number,
};

export type Token = {
  position: Position,
  radius: number,
};

export type Tokens = {
  [string]: Token,
};

export type State = {
  stage: Dimensions,
  currentTokenId: ?string,
  tokens: Tokens,
};

export default function generateState(): State {
  return {
    stage: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
    currentTokenId: null,
    tokens: {
      abcd: {
        position: {
          x: 60,
          y: 60,
        },
        radius: 6,
      },
      bcda: {
        position: {
          x: 12,
          y: 40,
        },
        radius: 6,
      },
      zyx: {
        position: {
          x: 30,
          y: 60,
        },
        radius: 6,
      },
    },
  };
}
