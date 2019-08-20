// @flow

export type PhaseName = 'lobby' | 'romance' | 'countdown' | 'finished';
export type Phase = {|
  name: PhaseName,
  updatedAt?: number,
|};

export type Players = {|
  [string]: {|
    id: string,
    name: string,
    color: string,
    active: boolean,
  |},
|};

export type NodeType = 'storage' | 'shared' | 'loveBucket';
export type Nodes = {|
  [string]: {|
    id: string,
    type: NodeType,
    playerIds: string[],
  |},
|};

export type TokenType = 'heart' | 'cookie' | 'cake' | 'candy';
export type Tokens = {|
  [string]: {|
    id: string,
    nodeId: string,
    type: TokenType,
  |},
|};

export type RelationshipType = 'crush' | 'wingman';
export type Relationships = {|
  [string]: {|
    id: string,
    type: RelationshipType,
    fromId: string,
    toId: string,
  |},
|};

export type Needs = {|
  [string]: {|
    id: string,
    playerId: string,
    type: TokenType,
    count: number,
  |},
|};

export type ServerState = {|
  phase: Phase,
  players: Players,
  nodes: Nodes,
  tokens: Tokens,
  relationships: Relationships,
  needs: Needs,
|};

export type SubServerState = $Values<ServerState>;
export type ServerStateKeys = $Keys<ServerState>;

export type Message =
  | {
      type: 'transferToken',
      tokenId: string,
      fromId: string,
      toId: string,
    }
  | {
      type: 'finishRound',
      playerId: string,
    };

export type SessionInfo = {|
  sessionId: string,
  playerId: string,
  playerName: string,
|};
