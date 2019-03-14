// @flow

import uniqid from 'uniqid';

import type { ServerState } from './networkTypes';

type NewPlayerStateProps = {
  playerId: string,
  playerName: string,
};

export function getNewPlayerState({
  playerId,
  playerName,
}: NewPlayerStateProps): $Shape<ServerState> {
  const nodeId1 = uniqid();
  const nodeId2 = uniqid();
  const tokenId = uniqid();
  return {
    players: {
      [playerId]: {
        id: playerId,
        name: playerName,
        active: true,
      },
    },
    nodes: {
      [nodeId1]: {
        id: nodeId1,
        playerId,
        type: 'storage',
      },
      [nodeId2]: {
        id: nodeId2,
        playerId,
        type: 'loveBucket',
      },
    },
    tokens: {
      [tokenId]: {
        id: tokenId,
        nodeId: nodeId1,
      },
    },
  };
}
