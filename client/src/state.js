// @flow

import type Socket from 'socket.io-client';

export type SessionInfo = {|
  sessionId: string,
  playerId: string,
  playerName: string,
|};

export type Position = {|
  x: number,
  y: number,
|};

export type Dimensions = {|
  width: number,
  height: number,
|};

export type Player = {
  id: string,
  name: string,
}

export type Players = {
  [string]: Player,
}

export type Token = {|
  id: string,
  position: Position,
  radius: number,
  nodeId: string,
|};

export type Tokens = {
  [string]: Token,
};

export type Node = {|
  id: string,
  position: Position,
  radius: number,
  playerId: string,
|};

export type Nodes = {
  [string]: Node,
};

export type State = {|
  socket: ?Socket,
  sessionInfo: SessionInfo,
  currentTokenId: ?string,
  players: Players,
  tokens: Tokens,
  nodes: Nodes,
|};

export default function generateState(sessionInfo: SessionInfo): State {
  return {
    socket: null,
    sessionInfo: {
      sessionId: 'abcd',
      playerId: 'bob',
      playerName: 'yo',
    },
    currentTokenId: null,
    players: {},
    tokens: {},
    nodes: {},
  };
}
