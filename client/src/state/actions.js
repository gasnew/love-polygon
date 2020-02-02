// @flow

import _ from 'lodash';

import type { Socket } from 'socket.io-client';

import {
  getCrushSelections,
  getPhase,
  getPlayerCrushSelection,
  getPlayer,
  getPlayers,
  getNodes,
  getSessionInfo,
  getState,
  getToken,
  getTokens,
  getVotingOrder,
} from './getters';
import { GAME_STATE_UPDATED } from './state';
import type {
  CrushSelection,
  CrushSelections,
  NodeType,
  Phase,
  PhaseName,
  SessionInfo,
  TokenType,
} from '../../../server/networkTypes';
import type {
  Needs,
  Node,
  Nodes,
  Player,
  Relationships,
  State,
  Token,
  Tokens,
} from './state';

const ADD_PLAYER = 'addPlayer';
const SET_PLAYER_NAME = 'setPlayerName';
const ADD_NODE = 'addNode';
const ADD_TOKEN = 'addToken';
const CLEAR_STAGE = 'clearStage';
const SET_PHASE = 'setPhase';
const SET_RELATIONSHIPS = 'setRelationships';
const SET_NEEDS = 'setNeeds';
const SET_SOCKET = 'setSocket';
const SET_TOKEN_NODE_ID = 'setTokenNodeId';
const SET_CURRENT_TOKEN = 'setCurrentTokenId';
const SET_CURRENT_VOTER = 'setCurrentVoter';
const SET_PARTY_LEADER = 'setPartyLeader';
const SUBMIT_VOTES = 'submitVotes';
const SET_VOTING_ORDER = 'setVotingOrder';
const START_COUNTDOWN = 'startCountdown';
const SET_CRUSH_SELECTIONS = 'setCrushSelections';
const SELECT_PLAYER = 'selectPlayer';
const DESELECT_PLAYER = 'deselectPlayer';

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
      type: 'setPlayerName',
      playerId: string,
      name: string,
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
      type: 'setCrushSelections',
      crushSelections: CrushSelections,
    }
  | {
      type: 'selectPlayer',
      sourcePlayerId: string,
      targetPlayerId: string,
    }
  | {
      type: 'deselectPlayer',
      sourcePlayerId: string,
      targetPlayerId: string,
    }
  | {
      type: 'setSocket',
      socket: Socket,
    }
  | {
      type: 'setVotingOrder',
      votingOrder: string[],
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
      type: 'setPartyLeader',
      partyLeaderId: string,
    }
  | {
      type: 'setCurrentVoter',
      currentVoter: ?string,
    }
  | {
      type: 'submitVotes',
      currentVoterId: string,
    }
  | {
      type: 'startCountdown',
    };

const mergeIntoState = (key: $Keys<State>, subState: $Values<State>) => {
  window.state = {
    ...getState(),
    [key]: subState,
  };
};

const mergeIntoCrushSelections = (
  crushSelectionId: string,
  crushSelection: CrushSelection
) => {
  mergeIntoState('crushSelections', {
    ...getCrushSelections(),
    [crushSelectionId]: crushSelection,
  });
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

export function setPartyLeader(partyLeaderId: string): Action {
  return {
    type: SET_PARTY_LEADER,
    partyLeaderId,
  };
}

export function setCrushSelections(crushSelections: CrushSelections): Action {
  return {
    type: SET_CRUSH_SELECTIONS,
    crushSelections,
  };
}

export function selectPlayer(
  sourcePlayerId: string,
  targetPlayerId: string
): Action {
  return {
    type: SELECT_PLAYER,
    sourcePlayerId,
    targetPlayerId,
  };
}

export function deselectPlayer(
  sourcePlayerId: string,
  targetPlayerId: string
): Action {
  return {
    type: DESELECT_PLAYER,
    sourcePlayerId,
    targetPlayerId,
  };
}

export function setVotingOrder(votingOrder: string[]): Action {
  return {
    type: SET_VOTING_ORDER,
    votingOrder,
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

export function setPlayerName(playerId: string, name: string): Action {
  return {
    type: SET_PLAYER_NAME,
    playerId,
    name,
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

export function setCurrentVoter(currentVoter: ?string): Action {
  return {
    type: SET_CURRENT_VOTER,
    currentVoter,
  };
}

export function submitVotes(currentVoterId: string): Action {
  return {
    type: SUBMIT_VOTES,
    currentVoterId,
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
    case SET_PLAYER_NAME:
      mergeIntoPlayers(action.playerId, {
        ...getPlayer(action.playerId),
        name: action.name,
      });

      const sessionInfo = getSessionInfo();
      if (action.playerId === sessionInfo.playerId)
        mergeIntoState(
          'sessionInfo',
          ({
            ...sessionInfo,
            playerName: action.name,
          }: SessionInfo)
        );
      break;
    case ADD_TOKEN:
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
      mergeIntoState(
        'phase',
        ({
          name: action.phase.name,
          countdownStartedAt: action.phase.countdownStartedAt,
        }: Phase)
      );
      break;
    case SET_PARTY_LEADER:
      mergeIntoState('partyLeader', action.partyLeaderId);
      break;
    case SET_CRUSH_SELECTIONS:
      mergeIntoState('crushSelections', action.crushSelections);
      break;
    case SELECT_PLAYER:
      _.flow(
        getPlayerCrushSelection,
        crushSelection =>
          mergeIntoCrushSelections(crushSelection.id, {
            ...crushSelection,
            playerIds: [...crushSelection.playerIds, action.targetPlayerId],
          })
      )(action.sourcePlayerId);
      break;
    case DESELECT_PLAYER:
      _.flow(
        getPlayerCrushSelection,
        crushSelection =>
          mergeIntoCrushSelections(crushSelection.id, {
            ...crushSelection,
            playerIds: _.difference(
              getPlayerCrushSelection(action.sourcePlayerId).playerIds,
              [action.targetPlayerId]
            ),
          })
      )(action.sourcePlayerId);
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
    case SET_CURRENT_VOTER:
      mergeIntoState('currentVoter', action.currentVoter);
      break;
    case SUBMIT_VOTES:
      const crushSelection = getPlayerCrushSelection(action.currentVoterId);
      mergeIntoCrushSelections(crushSelection.id, {
        ...crushSelection,
        finalized: true,
      });

      const votingOrder = getVotingOrder();
      if (action.currentVoterId !== votingOrder[votingOrder.length - 1])
        mergeIntoState(
          'currentVoter',
          votingOrder[votingOrder.indexOf(action.currentVoterId) + 1]
        );
      break;
    case SET_VOTING_ORDER:
      mergeIntoState('votingOrder', action.votingOrder);
      break;
    case START_COUNTDOWN:
      mergeIntoState('phase', {
        name: (getPhase() || {}).name,
        countdownStartedAt: (Date.now(): number),
      });
      break;
    default:
      throw new Error(`Yo, action ${action.type} doesn't exist!`);
  }

  window.dispatchEvent(event);
}
