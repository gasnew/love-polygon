// @flow

import _ from 'lodash';

import { getSessionInfo, getSocket } from '../state/getters';

import type { Message } from '../../../server/networkTypes';

const FINISH_ROUND = 'finishRound';
const TRANSFER_TOKEN = 'transferToken';

export function finishRound(): Message {
  return {
    type: FINISH_ROUND,
    playerId: getSessionInfo().playerId,
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
  if (!_.includes([TRANSFER_TOKEN, FINISH_ROUND], message.type))
    throw new Error(`Yo, message ${message.type} doesn't exist!`);

  const socket = getSocket();
  if (socket) socket.emit('newMessage', message);
}
