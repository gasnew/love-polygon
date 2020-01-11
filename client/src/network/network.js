// @flow

import _ from 'lodash';

import { getSessionInfo, getSocket } from '../state/getters';

import type { Message } from '../../../server/networkTypes';

const DESELECT_PLAYER = 'deselectPlayer';
const FINISH_ROUND = 'finishRound';
const SELECT_PLAYER = 'selectPlayer';
const SUBMIT_VOTES = 'submitVotes';
const TRANSFER_TOKEN = 'transferToken';

export function deselectPlayer(playerId: string): Message {
  return {
    type: DESELECT_PLAYER,
    playerId,
  };
}

export function finishRound(): Message {
  return {
    type: FINISH_ROUND,
    playerId: getSessionInfo().playerId,
  };
}

export function selectPlayer(playerId: string): Message {
  return {
    type: SELECT_PLAYER,
    playerId,
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

export default function announce(message: Message) {
  if (
    !_.includes(
      [
        DESELECT_PLAYER,
        SELECT_PLAYER,
        SUBMIT_VOTES,
        TRANSFER_TOKEN,
        FINISH_ROUND,
      ],
      message.type
    )
  )
    throw new Error(`Yo, message ${message.type} doesn't exist!`);

  const socket = getSocket();
  if (socket) socket.emit('newMessage', message);
}
