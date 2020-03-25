// @flow

export type PhaseName =
  | 'lobby'
  | 'romance'
  | 'countdown'
  | 'finished'
  | 'voting'
  | 'trueLove'
  | 'results';
export type Phase = {|
  name: PhaseName,
  countdownStartedAt?: number,
|};

export type Player = {|
  id: string,
  name: string,
  color: string,
  active: boolean,
  inRound: boolean,
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

export type TrueLoveSelection = {|
  id: string,
  playerId: string,
  player1Id: ?string,
  player2Id: ?string,
  finalized: boolean,
|};
export type TrueLoveSelections = {
  [string]: TrueLoveSelection,
};

export type Points = {
  [string]: number,
};

export type ServerState = {|
  phase: Phase,
  players: Players,
  nodes: Nodes,
  tokens: Tokens,
  playerOrder: string[],
  relationships: Relationships,
  needs: Needs,
  partyLeader: string,
  votingOrder: string[],
  currentVoter: ?string,
  roundEnder: ?string,
  crushSelections: CrushSelections,
  trueLoveSelections: TrueLoveSelections,
  roundNumber: number,
  points: Points,
|};

export type SubServerState = $Values<ServerState>;
export type ServerStateKeys = $Keys<ServerState>;

export type Message =
  | {
      type: 'setName',
      playerId: string,
      name: string,
    }
  | {
      type: 'startGame',
      playerId: string,
    }
  | {
      type: 'transferToken',
      tokenId: string,
      fromId: string,
      toId: string,
    }
  | {
      type: 'swapTokens',
      tokenId1: string,
      nodeId1: string,
      tokenId2: string,
      nodeId2: string,
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
    }
  | {
      type: 'submitTrueLoveSelections',
      playerId: string,
      player1Id: string,
      player2Id: string,
    }
  | {
      type: 'seeResults',
      playerId: string,
    }
  | {
      type: 'startTrueLoveVoting',
      playerId: string,
    }
  | {
      type: 'selectTrueLove',
      sourcePlayerId: string,
      targetPlayerId: string,
    }
  | {
      type: 'deselectTrueLove',
      sourcePlayerId: string,
      targetPlayerId: string,
    }
  | {
      type: 'startNextRound',
      playerId: string,
    }
  | {
      type: 'returnToLobby',
      playerId: string,
    };

export type SessionInfo = {|
  sessionId: string,
  playerId: string,
  playerName: ?string,
|};
