// @flow

const TRANSFER_TOKEN = 'transferToken';

type Message = {
  type: 'transferToken',
  tokenId: string,
  fromId: string,
  toId: string,
};

export function transferToken(tokenId: string, fromId: string, toId: string) {
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
      break;
    default:
      throw new Error(`Yo, message ${message.type} doesn't exist!`);
  }
}
