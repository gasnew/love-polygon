// @flow

import _ from 'lodash';

import { getSessionInfo, getSocket } from '../state/getters';

import type { Message } from '../../../server/networkTypes';

const DESELECT_PLAYER = 'deselectPlayer';
const FINISH_ROUND = 'finishRound';
const SELECT_PLAYER = 'selectPlayer';
const SUBMIT_VOTES = 'submitVotes';
const TRANSFER_TOKEN = 'transferToken';
const SWAP_TOKENS = 'swapTokens';

export function deselectPlayer(
  sourcePlayerId: string,
  targetPlayerId: string
): Message {
  return {
    type: DESELECT_PLAYER,
    sourcePlayerId,
    targetPlayerId,
  };
}

export function finishRound(): Message {
  return {
    type: FINISH_ROUND,
    playerId: getSessionInfo().playerId,
  };
}

export function selectPlayer(
  sourcePlayerId: string,
  targetPlayerId: string
): Message {
  return {
    type: SELECT_PLAYER,
    sourcePlayerId,
    targetPlayerId,
  };
}

export function submitVotes(currentVoterId: string): Message {
  return {
    type: SUBMIT_VOTES,
    currentVoterId,
  };
}

export function transferToken(
  tokenId: string,
  fromId: string,
  toId: string
): Message {
  return {
    type: TRANSFER_TOKEN,
    tokenId,
    fromId,
    toId,
  };
}

export function swapTokens(
  tokenId1: string,
  nodeId1: string,
  tokenId2: string,
  nodeId2: string
): Message {
  return {
    type: SWAP_TOKENS,
    tokenId1,
    nodeId1,
    tokenId2,
    nodeId2,
  };
}

export default function announce(message: Message) {
  if (
    !_.includes(
      [
        DESELECT_PLAYER,
        SELECT_PLAYER,
        SUBMIT_VOTES,
        TRANSFER_TOKEN,
        SWAP_TOKENS,
        FINISH_ROUND,
      ],
      message.type
    )
  )
    throw new Error(`Yo, message ${message.type} doesn't exist!`);

  const socket = getSocket();
  if (socket) socket.emit('newMessage', message);
}
