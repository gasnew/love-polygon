// @flow

import { useEffect, useState } from 'react';
import type Socket from 'socket.io-client';

import { getState } from './getters';
import type {
  NodeType,
  Phase,
  RelationshipType,
  SessionInfo,
  TokenType,
} from '../../../server/networkTypes';
import type { Primitive } from '../graphics/buildPrimitive';

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
  playerIds: string[],
  enabled: boolean,
|};

export type Nodes = {
  [string]: Node,
};

export type Relationship = {|
  id: string,
  type: RelationshipType,
  fromId: string,
  toId: string,
|};

export type Relationships = {
  [string]: Relationship,
};

export type Need = {|
  id: string,
  playerId: string,
  type: TokenType,
  count: number,
|};

export type Needs = {
  [string]: Need,
};

export type Button = {
  state: 'up' | 'down',
  position: Position,
  height: number,
  width: number,
};

export type Primitives = {
  [string]: Primitive<{}>,
};

export type State = {|
  phase: ?Phase,
  socket?: Socket,
  sessionInfo: SessionInfo,
  currentTokenId: ?string,
  players: Players,
  tokens: Tokens,
  nodes: Nodes,
  relationships: Relationships,
  needs: Needs,
  button: Button,
  primitives: Primitives,
|};

export default function generateState(
  sessionInfo: SessionInfo,
): State {
  return {
    sessionInfo,
    phase: null,
    currentTokenId: null,
    players: {},
    tokens: {},
    nodes: {
      abc: {
        id: 'abc',
        type: 'storage',
        playerIds: [],
        enabled: true,
      },
    },
    relationships: {},
    needs: {},
    button: {
      state: 'up',
      position: { x: 30, y: 65 },
      width: 28,
      height: 10,
    },
    primitives: {},
  };
}

export const GAME_STATE_UPDATED = 'gameStateUpdated';

export function useGameState() {
  const [gameState, setGameState] = useState(getState());

  const handleGameStateUpdated = event => {
    setGameState(getState());
  }
  useEffect(() => {
    window.addEventListener(GAME_STATE_UPDATED, handleGameStateUpdated);
    return () => {
      window.removeEventListener(GAME_STATE_UPDATED, handleGameStateUpdated);
    }
  });

  return gameState;
}
