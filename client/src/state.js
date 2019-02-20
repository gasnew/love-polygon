// @flow

import type Socket from 'socket.io-client';

export type Session = {|
  id: string,
  name: string,
|};

export type Position = {|
  x: number,
  y: number,
|};

export type Dimensions = {|
  width: number,
  height: number,
|};

export type Token = {|
  position: Position,
  radius: number,
  nodeId: string,
|};

export type Tokens = {
  [string]: Token,
};

export type Node = {|
  position: Position,
  radius: number,
|};

export type Nodes = {
  [string]: Node,
};

export type State = {|
  socket: ?Socket,
  session: Session,
  currentTokenId: ?string,
  tokens: Tokens,
  nodes: Nodes,
|};

export default function generateState(): State {
  return {
    socket: null,
    session: {
      id: 'abcd',
      name: 'dude play game',
    },
    currentTokenId: null,
    tokens: {
      abcd: {
        position: {
          x: 10,
          y: 10,
        },
        radius: 6,
        nodeId: 'ab',
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
