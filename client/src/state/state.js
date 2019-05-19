// @flow

import type Socket from 'socket.io-client';

import type {
  NodeType,
  Phase,
  SessionInfo,
  TokenType,
} from '../../../server/networkTypes';
import type { VisualObject } from '../graphics/visualObjects';

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
  color: string,
};

export type Players = {
  [string]: Player,
};

export type Token = {|
  id: string,
  type: TokenType,
  position: Position,
  radius: number,
  nodeId: string,
|};

export type Tokens = {
  [string]: Token,
};

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

export type RelationshipType = 'crush' | 'wingman';
export type Relationship = {|
  id: string,
  type: RelationshipType,
  fromId: string,
  toId: string,
|};

export type Relationships = {
  [string]: Relationship,
};

export type VisualObjects = {
  [string]: VisualObject<{}>,
};

export type State = {|
  phase: ?Phase,
  socket: Socket,
  sessionInfo: SessionInfo,
  currentTokenId: ?string,
  players: Players,
  tokens: Tokens,
  nodes: Nodes,
  relationships: Relationships,
  visualObjects: VisualObjects,
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
    relationships: {},
    visualObjects: {},
  };
}
