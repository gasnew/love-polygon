// @flow

export type Session = {|
  id: string,
  name: string,
|};

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

export type Node = {
  position: Position,
  radius: number,
};

export type Nodes = {
  [string]: Node,
};

export type State = {|
  session: Session,
  currentTokenId: ?string,
  tokens: Tokens,
  nodes: Nodes,
|};

export default function generateState(): State {
  return {
    session: {
      id: 'abcd',
      name: 'dude play game',
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
    nodes: {
      ab: {
        position: {
          x: 10,
          y: 10,
        },
        radius: 10,
      },
      cd: {
        position: {
          x: 50,
          y: 10,
        },
        radius: 10,
      },
    },
  };
}
