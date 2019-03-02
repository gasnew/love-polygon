// @flow

import _ from 'lodash';

import type Socket from 'socket.io-client';

import {
  getState,
  getPlayers,
  getNode,
  getNodes,
  getToken,
  getTokens,
} from './getters';
import layout from './layout';
import type { Node, Player, Token } from './state';

const ADD_PLAYER = 'addPlayer';
const ADD_NODE = 'addNode';
const ADD_TOKEN = 'addToken';
const SET_SOCKET = 'setSocket';
const SET_NODE_POSITION = 'setNodePosition';
const SET_TOKEN_POSITION = 'setTokenPosition';
const SET_TOKEN_NODE_ID = 'setTokenNodeId';
const SET_CURRENT_TOKEN = 'setCurrentTokenId';

type Action =
  | {
      type: 'addNode',
      id: string,
      playerId: string,
    }
  | {
      type: 'addPlayer',
      id: string,
      name: string,
    }
  | {
      type: 'addToken',
      id: string,
      nodeId: string,
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

export function setSocket(socket: Socket): Action {
  return {
    type: SET_SOCKET,
    socket,
  };
}

export function addPlayer(id: string, name: string) {
  return {
    type: ADD_PLAYER,
    id,
    name,
  };
}

export function addNode(id: string, playerId: string) {
  return {
    type: ADD_NODE,
    id,
    playerId,
  };
}

export function addToken(id: string, nodeId: string) {
  return {
    type: ADD_TOKEN,
    id,
    nodeId,
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

export default function dispatch(action: Action) {
  switch (action.type) {
    case ADD_NODE:
      mergeIntoNodes(action.id, {
        id: action.id,
        position: {
          x: 0,
          y: 0,
        },
        radius: 10,
        playerId: action.playerId,
      });
      const nodeIds = _.map(getNodes(), (node, id) => id);
      const nodeLayout = layout(nodeIds);
      _.each(nodeIds, id =>
        dispatch(setNodePosition(id, nodeLayout[id].x, nodeLayout[id].y))
      );
      _.each(getTokens(), token => {
        dispatch(setTokenNodeId(token.id, token.nodeId));
        const node = getNode(token.nodeId);
        dispatch(setTokenPosition(token.id, node.position.x, node.position.y));
      });
      break;
    case ADD_PLAYER:
      mergeIntoPlayers(action.id, {
        id: action.id,
        name: action.name,
      });
      break;
    case ADD_TOKEN:
      const node = getNode(action.nodeId);
      mergeIntoTokens(action.id, {
        id: action.id,
        position: node.position,
        radius: 10,
        nodeId: action.nodeId,
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
    default:
      throw new Error(`Yo, action ${action.type} doesn't exist!`);
  }
}
