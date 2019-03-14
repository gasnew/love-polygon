// @flow

import type Socket from 'socket.io-client';

import type { Phase, SessionInfo } from '../../server/networkTypes';

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
};

export type Players = {
  [string]: Player,
};

export type Token = {|
  id: string,
  position: Position,
  radius: number,
  nodeId: string,
|};

export type Tokens = {
  [string]: Token,
};

export type NodeType = 'storage' | 'shared' | 'loveBucket';
export type Node = {|
  id: string,
  type: NodeType,
  position: Position,
  radius: number,
  playerIds: string[],
|};

export type Nodes = {
  [string]: Node,
};

export type State = {|
  phase: ?Phase,
  socket: Socket,
  sessionInfo: SessionInfo,
  currentTokenId: ?string,
  players: Players,
  tokens: Tokens,
  nodes: Nodes,
|};

export default function generateState(
  sessionInfo: SessionInfo,
  socket: Socket
): State {
  return {
    sessionInfo,
    phase: null,
    socket,
    currentTokenId: null,
    players: {},
    tokens: {},
    nodes: {},
  };
}
