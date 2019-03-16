// @flow

import { getSocket } from './getters';

import type { Message } from '../../server/networkTypes';

const TRANSFER_TOKEN = 'transferToken';

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
  switch (message.type) {
    case TRANSFER_TOKEN:
      console.log(message);
      const socket = getSocket();
      if (socket) socket.emit('newMessage', message);
      break;
    default:
      throw new Error(`Yo, message ${message.type} doesn't exist!`);
  }
}
