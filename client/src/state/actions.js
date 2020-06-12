// @flow

import _ from 'lodash';

import type { Socket } from 'socket.io-client';

import {
  getActions,
  getCrushSelections,
  getNode,
  generatePlayerColor,
  getPartyLeader,
  getPhase,
  getPlayer,
  getPlayerCrushSelection,
  getPlayers,
  getPlayerTrueLoveSelection,
  getPlayerNodes,
  getPlayerOrder,
  getNodes,
  getSessionInfo,
  getState,
  getToken,
  getTokens,
  getTrueLoveSelections,
  getVotingOrder,
} from './getters';
import { GAME_STATE_UPDATED } from './state';
import type {
  CrushSelection,
  CrushSelections,
  NodeType,
  Phase,
  PhaseName,
  Points,
  SessionInfo,
  TokenType,
  TrueLoveSelection,
  TrueLoveSelections,
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
const TRANSFER_TOKEN = 'transferToken';
const SET_CURRENT_TOKEN = 'setCurrentTokenId';
const SET_CURRENT_VOTER = 'setCurrentVoter';
const SET_PARTY_LEADER = 'setPartyLeader';
const SET_PLAYER_ORDER = 'setPlayerOrder';
const SUBMIT_VOTES = 'submitVotes';
const SET_VOTING_ORDER = 'setVotingOrder';
const START_COUNTDOWN = 'startCountdown';
const SET_CRUSH_SELECTIONS = 'setCrushSelections';
const SELECT_PLAYER = 'selectPlayer';
const DESELECT_PLAYER = 'deselectPlayer';
const SET_TRUE_LOVE_SELECTIONS = 'setTrueLoveSelections';
const SET_TRUE_LOVE_SELECTION = 'setTrueLoveSelection';
const SELECT_TRUE_LOVE = 'selectTrueLove';
const DESELECT_TRUE_LOVE = 'deselectTrueLove';
const SUBMIT_TRUE_LOVE_SELECTIONS = 'submitTrueLoveSelections';
const SET_ROUND_NUMBER = 'setRoundNumber';
const SET_POINTS = 'setPoints';

export type Action =
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
      inRound: boolean,
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
      type: 'setTrueLoveSelections',
      trueLoveSelections: TrueLoveSelections,
    }
  | {
      type: 'setTrueLoveSelection',
      trueLoveSelection: TrueLoveSelection,
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
      type: 'submitTrueLoveSelections',
      playerId: string,
      player1Id: string,
      player2Id: string,
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
      type: 'transferToken',
      tokenId: string,
      fromId: string,
      toId: string,
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
      type: 'setPlayerOrder',
      playerOrder: string[],
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
    }
  | {
      type: 'setRoundNumber',
      roundNumber: number,
    }
  | {
      type: 'setPoints',
      points: Points,
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

const mergeIntoTrueLoveSelections = (
  trueLoveSelectionId: string,
  trueLoveSelection: TrueLoveSelection
) => {
  mergeIntoState('trueLoveSelections', {
    ...getTrueLoveSelections(),
    [trueLoveSelectionId]: trueLoveSelection,
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

export function setPlayerOrder(playerOrder: string[]): Action {
  return {
    type: SET_PLAYER_ORDER,
    playerOrder,
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

export function setTrueLoveSelections(
  trueLoveSelections: TrueLoveSelections
): Action {
  return {
    type: SET_TRUE_LOVE_SELECTIONS,
    trueLoveSelections,
  };
}

export function setTrueLoveSelection(
  trueLoveSelection: TrueLoveSelection
): Action {
  return {
    type: SET_TRUE_LOVE_SELECTION,
    trueLoveSelection,
  };
}

export function selectTrueLove(
  sourcePlayerId: string,
  targetPlayerId: string
): Action {
  return {
    type: SELECT_TRUE_LOVE,
    sourcePlayerId,
    targetPlayerId,
  };
}

export function deselectTrueLove(
  sourcePlayerId: string,
  targetPlayerId: string
): Action {
  return {
    type: DESELECT_TRUE_LOVE,
    sourcePlayerId,
    targetPlayerId,
  };
}

export function submitTrueLoveSelections(
  playerId: string,
  player1Id: string,
  player2Id: string
): Action {
  return {
    type: SUBMIT_TRUE_LOVE_SELECTIONS,
    playerId,
    player1Id,
    player2Id,
  };
}

export function setVotingOrder(votingOrder: string[]): Action {
  return {
    type: SET_VOTING_ORDER,
    votingOrder,
  };
}

export function addPlayer(
  id: string,
  name: string,
  color: string,
  inRound: boolean
): Action {
  return {
    type: ADD_PLAYER,
    id,
    name,
    color,
    inRound,
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

export function transferToken(
  tokenId: string,
  fromId: string,
  toId: string
): Action {
  return {
    type: TRANSFER_TOKEN,
    tokenId,
    fromId,
    toId,
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

export function setRoundNumber(roundNumber: number): Action {
  return {
    type: SET_ROUND_NUMBER,
    roundNumber,
  };
}

export function setPoints(points: Points): Action {
  return {
    type: SET_POINTS,
    points,
  };
}

export function silentDispatch(action: Action) {
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
        color: generatePlayerColor(action.id),
        inRound: action.inRound,
      });
      break;
    case SET_PLAYER_NAME:
      // Set player name
      mergeIntoPlayers(action.playerId, {
        ...getPlayer(action.playerId),
        name: action.name,
      });

      // Update sessionInfo
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
    case SET_PLAYER_ORDER:
      mergeIntoState('playerOrder', action.playerOrder);

      _.each(getPlayers(), player =>
        mergeIntoPlayers(player.id, {
          ...getPlayer(player.id),
          color: generatePlayerColor(player.id),
        })
      );

      break;
    case SET_CRUSH_SELECTIONS:
      mergeIntoState('crushSelections', action.crushSelections);
      break;
    case SELECT_PLAYER:
      _.flow(getPlayerCrushSelection, crushSelection =>
        mergeIntoCrushSelections(crushSelection.id, {
          ...crushSelection,
          playerIds: [...crushSelection.playerIds, action.targetPlayerId],
        })
      )(action.sourcePlayerId);
      break;
    case DESELECT_PLAYER:
      _.flow(getPlayerCrushSelection, crushSelection =>
        mergeIntoCrushSelections(crushSelection.id, {
          ...crushSelection,
          playerIds: _.difference(
            getPlayerCrushSelection(action.sourcePlayerId).playerIds,
            [action.targetPlayerId]
          ),
        })
      )(action.sourcePlayerId);
      break;
    case SET_TRUE_LOVE_SELECTIONS:
      mergeIntoState('trueLoveSelections', action.trueLoveSelections);
      break;
    case SET_TRUE_LOVE_SELECTION:
      mergeIntoTrueLoveSelections(
        action.trueLoveSelection.id,
        action.trueLoveSelection
      );
      break;
    case SELECT_TRUE_LOVE:
      _.flow(getPlayerTrueLoveSelection, selection =>
        mergeIntoTrueLoveSelections(selection.id, {
          ...selection,
          ...(selection.player1Id
            ? { player2Id: action.targetPlayerId }
            : { player1Id: action.targetPlayerId }),
        })
      )(action.sourcePlayerId);
      break;
    case DESELECT_TRUE_LOVE:
      _.flow(getPlayerTrueLoveSelection, selection =>
        mergeIntoTrueLoveSelections(selection.id, {
          ...selection,
          ...(selection.player1Id === action.targetPlayerId
            ? { player1Id: null }
            : { player2Id: null }),
        })
      )(action.sourcePlayerId);
      break;
    case SUBMIT_TRUE_LOVE_SELECTIONS:
      _.flow(getPlayerTrueLoveSelection, selection =>
        mergeIntoTrueLoveSelections(selection.id, {
          ...selection,
          finalized: true,
        })
      )(action.playerId);
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
    case TRANSFER_TOKEN:
      mergeIntoTokens(action.tokenId, {
        ...getToken(action.tokenId),
        nodeId: action.toId,
      });

      // Check for inserting player into playerOrder
      if ((getPhase() || {}).name === 'lobby') {
        const toNode = getNode(action.toId);
        const fromNode = getNode(action.fromId);
        const playerId = fromNode.playerIds[0];
        const playerOrder = getPlayerOrder();
        if (toNode.type === 'loveBucket') {
          dispatch(setPlayerOrder([...playerOrder, playerId]));
          if (!getPartyLeader()) mergeIntoState('partyLeader', playerId);
        } else if (fromNode.type === 'loveBucket') {
          const newPlayerOrder = _.difference(playerOrder, [playerId]);
          dispatch(setPlayerOrder(newPlayerOrder));
          mergeIntoState('partyLeader', newPlayerOrder[0] || null);
        }
      }
      const toNode = getNode(action.toId);
      const fromNode = getNode(action.fromId);
      if (toNode.type === 'loveBucket' && !getPartyLeader())
        mergeIntoState('partyLeader', toNode.playerIds[0]);
      else if (
        fromNode.type === 'loveBucket' &&
        fromNode.playerIds[0] === getPartyLeader()
      )
        mergeIntoState('partyLeader', null);
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
      mergeIntoState(
        'phase',
        ({
          name: (getPhase() || {}).name,
          countdownStartedAt: Date.now(),
        }: Phase)
      );
      break;
    case SET_ROUND_NUMBER:
      mergeIntoState('roundNumber', action.roundNumber);
      break;
    case SET_POINTS:
      mergeIntoState('points', action.points);
      break;
    default:
      throw new Error(`Yo, action ${action.type} doesn't exist!`);
  }
  if (process.env.NODE_ENV)
    mergeIntoState('actions', ([...getActions(), action]: Action[]));
}

const event = new Event(GAME_STATE_UPDATED);
export default function dispatch(action: Action) {
  silentDispatch(action);
  window.dispatchEvent(event);
}
