// @flow

export type Phase = {|
  name: 'lobby', // or sweatyHandshake
|};

export type Players = {|
  [string]: {
    id: string,
    name: string,
    active: string,
  },
|};

type NodeType = 'storage' | 'shared' | 'loveBucket';
export type Nodes = {|
  [string]: {
    id: string,
    type: NodeType,
    playerId: string,
  },
|};

export type Tokens = {|
  [string]: {
    id: string,
    nodeId: string,
  },
|};

export type ServerState = {|
  phase: Phase,
  players: Players,
  nodes: Nodes,
  tokens: Tokens,
|};

export type SubServerState = $Values<ServerState>;
export type ServerStateKeys = $Keys<ServerState>;

export type Message = {
  type: 'transferToken',
  tokenId: string,
  fromId: string,
  toId: string,
};

export type SessionInfo = {|
  sessionId: string,
  playerId: string,
  playerName: string,
|};
