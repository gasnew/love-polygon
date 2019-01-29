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
