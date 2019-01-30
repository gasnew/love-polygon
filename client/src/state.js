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

export type Tokens = Array<Token>;

export type State = {
  stage: Dimensions,
  tokens: Tokens,
};

export default function generateState(): State {
  return {
    stage: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
    tokens: [
      {
        position: {
          x: 60,
          y: 60,
        },
        radius: 6,
      },
      {
        position: {
          x: 12,
          y: 40,
        },
        radius: 6,
      },
      {
        position: {
          x: 30,
          y: 60,
        },
        radius: 6,
      },
    ],
  };
}
