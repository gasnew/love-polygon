// @flow

import _ from 'lodash';

import type { Socket } from 'socket.io-client';

import {
  getState,
  getPhase,
  getPlayers,
  getNode,
  getNodes,
  getOwnNodes,
  getOwnTokens,
  getToken,
  getTokens,
} from './getters';
import { GAME_STATE_UPDATED } from './state';
import type {
  NodeType,
  Phase,
  PhaseName,
  TokenType,
} from '../../../server/networkTypes';
import type {
  Needs,
  Node,
  Nodes,
  Player,
  Relationships,
  Token,
  Tokens,
} from './state';

const ADD_PLAYER = 'addPlayer';
const ADD_NODE = 'addNode';
const ADD_TOKEN = 'addToken';
const CLEAR_STAGE = 'clearStage';
const SET_PHASE = 'setPhase';
const SET_RELATIONSHIPS = 'setRelationships';
const SET_NEEDS = 'setNeeds';
const SET_SOCKET = 'setSocket';
const SET_TOKEN_NODE_ID = 'setTokenNodeId';
const SET_CURRENT_TOKEN = 'setCurrentTokenId';
const START_COUNTDOWN = 'startCountdown';

type Action =
  | {
      type: 'addNode',
      id: string,
      nodeType: NodeType,
      playerIds: string[],
      enabled: boolean,
    }
  | {
      type: 'addPlayer',
      id: string,
      name: string,
      color: string,
    }
  | {
      type: 'addToken',
      id: string,
      tokenType: TokenType,
      nodeId: string,
    }
  | {
      type: 'clearStage',
    }
  | {
      type: 'setPhase',
      phase: Phase,
    }
  | {
      type: 'setRelationships',
      relationships: Relationships,
    }
  | {
      type: 'setNeeds',
      needs: Needs,
    }
  | {
      type: 'setSocket',
      socket: Socket,
    }
  | {
      type: 'setTokenNodeId',
      tokenId: string,
      nodeId: string,
    }
  | {
      type: 'setCurrentTokenId',
      tokenId: ?string,
    }
  | {
      type: 'startCountdown',
    };

const mergeIntoState = (key, subState) => {
  window.state = {
    ...getState(),
    [key]: subState,
  };
};

const mergeIntoPlayers = (playerId: string, player: Player) => {
  mergeIntoState('players', {
    ...getPlayers(),
    [playerId]: player,
  });
};

const mergeIntoNodes = (nodeId: string, node: Node) => {
  mergeIntoState('nodes', {
    ...getNodes(),
    [nodeId]: node,
  });
};

const mergeIntoTokens = (tokenId: string, token: Token) => {
  mergeIntoState('tokens', {
    ...getTokens(),
    [tokenId]: token,
  });
};

const setNodes = (nodes: Nodes) => {
  mergeIntoState('nodes', nodes);
};

const setTokens = (tokens: Tokens) => {
  mergeIntoState('tokens', tokens);
};

export function setPhase(name: PhaseName): Action {
  const countdownStartedAt = (getPhase() || {}).countdownStartedAt;
  return {
    type: SET_PHASE,
    phase: {
      name,
      countdownStartedAt,
    },
  };
}

export function setSocket(socket: Socket): Action {
  return {
    type: SET_SOCKET,
    socket,
  };
}

export function addPlayer(id: string, name: string, color: string): Action {
  return {
    type: ADD_PLAYER,
    id,
    name,
    color,
  };
}

export function addNode(
  id: string,
  type: NodeType,
  playerIds: string[],
  enabled: boolean
): Action {
  return {
    type: ADD_NODE,
    id,
    nodeType: type,
    playerIds,
    enabled,
  };
}

export function addToken(id: string, type: TokenType, nodeId: string): Action {
  return {
    type: ADD_TOKEN,
    id,
    tokenType: type,
    nodeId,
  };
}

export function clearStage(): Action {
  return {
    type: CLEAR_STAGE,
  };
}

export function setTokenNodeId(tokenId: string, nodeId: string): Action {
  return {
    type: SET_TOKEN_NODE_ID,
    tokenId,
    nodeId,
  };
}

export function setCurrentTokenId(tokenId: ?string): Action {
  return {
    type: SET_CURRENT_TOKEN,
    tokenId,
  };
}

export function setRelationships(relationships: Relationships): Action {
  return {
    type: SET_RELATIONSHIPS,
    relationships,
  };
}

export function setNeeds(needs: Needs): Action {
  return {
    type: SET_NEEDS,
    needs,
  };
}

export function startCountdown(): Action {
  return {
    type: START_COUNTDOWN,
  };
}

const event = new Event(GAME_STATE_UPDATED);
export default function dispatch(action: Action) {
  switch (action.type) {
    case ADD_NODE:
      mergeIntoNodes(action.id, {
        id: action.id,
        type: action.nodeType,
        playerIds: action.playerIds,
        enabled: action.enabled,
      });
      break;
    case ADD_PLAYER:
      mergeIntoPlayers(action.id, {
        id: action.id,
        name: action.name,
        color: action.color,
      });
      break;
    case ADD_TOKEN:
      const node = getNode(action.nodeId);
      mergeIntoTokens(action.id, {
        id: action.id,
        type: action.tokenType,
        nodeId: action.nodeId,
      });
      break;
    case CLEAR_STAGE:
      setTokens({});
      setNodes({});
      break;
    case SET_PHASE:
      mergeIntoState('phase', {
        name: action.phase.name,
        countdownStartedAt: action.phase.countdownStartedAt,
      });
      break;
    case SET_SOCKET:
      mergeIntoState('socket', action.socket);
      break;
    case SET_RELATIONSHIPS:
      mergeIntoState('relationships', action.relationships);
      break;
    case SET_NEEDS:
      mergeIntoState('needs', action.needs);
      break;
    case SET_TOKEN_NODE_ID:
      mergeIntoTokens(action.tokenId, {
        ...getToken(action.tokenId),
        nodeId: action.nodeId,
      });
      break;
    case SET_CURRENT_TOKEN:
      mergeIntoState('currentTokenId', action.tokenId);
      break;
    case START_COUNTDOWN:
      mergeIntoState('phase', {
        name: (getPhase() || {}).name,
        countdownStartedAt: Date.now(),
      });
      break;
    default:
      throw new Error(`Yo, action ${action.type} doesn't exist!`);
  }

  window.dispatchEvent(event);
}
