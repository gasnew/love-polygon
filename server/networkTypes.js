// @flow

export type PhaseName =
  | 'lobby'
  | 'romance'
  | 'countdown'
  | 'finished'
  | 'voting';
export type Phase = {|
  name: PhaseName,
  countdownStartedAt?: number,
|};

export type Player = {|
  id: string,
  name: string,
  color: string,
  active: boolean,
|};
export type Players = {|
  [string]: Player,
|};

export type NodeType = 'storage' | 'shared' | 'loveBucket';
export type Nodes = {|
  [string]: {|
    id: string,
    type: NodeType,
    playerIds: string[],
    enabled: boolean,
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

export type CrushSelection = {|
  id: string,
  playerId: string,
  playerIds: string[],
  finalized: boolean,
|};
export type CrushSelections = {
  [string]: CrushSelection,
};

export type ServerState = {|
  phase: Phase,
  players: Players,
  nodes: Nodes,
  tokens: Tokens,
  relationships: Relationships,
  needs: Needs,
  partyLeader: string,
  votingOrder: string[],
  currentVoter: ?string,
  roundEnder: ?string,
  crushSelections: CrushSelections,
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
    }
  | {
      type: 'selectPlayer',
      sourcePlayerId: string,
      targetPlayerId: string,
    }
  | {
      type: 'submitVotes',
      currentVoterId: string,
    }
  | {
      type: 'deselectPlayer',
      sourcePlayerId: string,
      targetPlayerId: string,
    };

export type SessionInfo = {|
  sessionId: string,
  playerId: string,
  playerName: string,
|};
