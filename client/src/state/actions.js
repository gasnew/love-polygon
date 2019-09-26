// @flow

import _ from 'lodash';

import type Socket from 'socket.io-client';

import {
  getButton,
  getState,
  getPhase,
  getPlayers,
  getNode,
  getNodes,
  getOwnNodes,
  getOwnTokens,
  getToken,
  getTokens,
  getPrimitives,
} from './getters';
import { GAME_STATE_UPDATED } from './state';
import { layoutNodes } from '../graphics/layout';
import type {
  NodeType,
  Phase,
  PhaseName,
  TokenType,
} from '../../../server/networkTypes';
import type { Primitive } from '../graphics/buildPrimitive';
import type {
  Needs,
  Node,
  Nodes,
  Player,
  Relationships,
  Token,
  Tokens,
} from './state';

const ADD_PRIMITIVE = 'addPrimitive';
const ADD_PLAYER = 'addPlayer';
const ADD_NODE = 'addNode';
const ADD_TOKEN = 'addToken';
const CLEAR_STAGE = 'clearStage';
const PRESS_BUTTON = 'pressButton';
const RELEASE_BUTTON = 'releaseButton';
const SET_PHASE = 'setPhase';
const SET_RELATIONSHIPS = 'setRelationships';
const SET_NEEDS = 'setNeeds';
const SET_SOCKET = 'setSocket';
const SET_NODE_POSITION = 'setNodePosition';
const SET_TOKEN_POSITION = 'setTokenPosition';
const SET_TOKEN_NODE_ID = 'setTokenNodeId';
const SET_CURRENT_TOKEN = 'setCurrentTokenId';
const START_COUNTDOWN = 'startCountdown';

type Action =
  | {
      type: 'addPrimitive',
      id: string,
      primitive: Primitive<{}>,
    }
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
      type: 'pressButton',
    }
  | {
      type: 'releaseButton',
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
      type: 'setNodePosition',
      nodeId: string,
      x: number,
      y: number,
    }
  | {
      type: 'setTokenPosition',
      tokenId: string,
      x: number,
      y: number,
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

const mergeIntoPrimitives = (primitiveId: string, primitive: Primitive<{}>) => {
  mergeIntoState('primitives', {
    ...getPrimitives(),
    [primitiveId]: primitive,
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

export function addPrimitive(id: string, primitive: Primitive<{}>): Action {
  return {
    type: ADD_PRIMITIVE,
    id,
    primitive,
  };
}

export function clearStage(): Action {
  return {
    type: CLEAR_STAGE,
  };
}

export function pressButton(): Action {
  return {
    type: PRESS_BUTTON,
  };
}

export function releaseButton(): Action {
  return {
    type: RELEASE_BUTTON,
  };
}

export function setNodePosition(nodeId: string, x: number, y: number): Action {
  return {
    type: SET_NODE_POSITION,
    nodeId,
    x,
    y,
  };
}

export function setTokenPosition(
  tokenId: string,
  x: number,
  y: number
): Action {
  return {
    type: SET_TOKEN_POSITION,
    tokenId,
    x,
    y,
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
    case ADD_PRIMITIVE:
      mergeIntoPrimitives(action.id, action.primitive);
      break;
    case ADD_NODE:
      mergeIntoNodes(action.id, {
        id: action.id,
        type: action.nodeType,
        position: {
          x: 0,
          y: 0,
        },
        radius: 10,
        playerIds: action.playerIds,
        enabled: action.enabled,
      });
      const nodes = getOwnNodes();
      const nodeLayout = layoutNodes(nodes);
      _.each(nodes, (node, id) =>
        dispatch(setNodePosition(id, nodeLayout[id].x, nodeLayout[id].y))
      );
      _.each(getOwnTokens(), token => {
        dispatch(setTokenNodeId(token.id, token.nodeId));
        const node = getNode(token.nodeId);
        dispatch(setTokenPosition(token.id, node.position.x, node.position.y));
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
        position: node.position,
        radius: 10,
        nodeId: action.nodeId,
      });
      break;
    case CLEAR_STAGE:
      setTokens({});
      setNodes({});
      break;
    case PRESS_BUTTON:
      mergeIntoState('button', { ...getButton(), state: 'down' });
      break;
    case RELEASE_BUTTON:
      mergeIntoState('button', { ...getButton(), state: 'up' });
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
    case SET_NODE_POSITION:
      mergeIntoNodes(action.nodeId, {
        ...getNode(action.nodeId),
        position: {
          x: action.x,
          y: action.y,
        },
      });
      break;
    case SET_RELATIONSHIPS:
      mergeIntoState('relationships', action.relationships);
      break;
    case SET_NEEDS:
      mergeIntoState('needs', action.needs);
      break;
    case SET_TOKEN_POSITION:
      mergeIntoTokens(action.tokenId, {
        ...getToken(action.tokenId),
        position: {
          x: action.x,
          y: action.y,
        },
      });
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

  console.log('DISPATCH');
  window.dispatchEvent(event);
}
