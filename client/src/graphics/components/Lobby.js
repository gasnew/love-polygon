// @flow

import Button from '@material-ui/core/Button';
import _ from 'lodash';
import React from 'react';

import SlotList from './SlotList';
import announce, { startGame } from '../../network/network';
import {
  getPlayers,
  getNodes,
  getOwnNodes,
  getPartyLeader,
  getSessionInfo,
  getTokens,
} from '../../state/getters';

export default function Lobby() {
  const { playerId } = getSessionInfo();
  const nodes = getOwnNodes();
  const loveBucket = _.pickBy(nodes, ['type', 'loveBucket']);
  const loveBuckets = _.pickBy(getNodes(), ['type', 'loveBucket']);
  const storageNodes = _.pickBy(nodes, ['type', 'storage']);

  const readyPlayerCount = _.filter(
    getTokens(),
    token => loveBuckets[token.nodeId]
  ).length;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '50%',
      }}
    >
      <div>
        <SlotList nodes={loveBucket} />
      </div>
      <div>
        <SlotList nodes={storageNodes} />
      </div>
      {playerId === getPartyLeader() && (
        <Button
          variant="contained"
          color="primary"
          onClick={() => announce(startGame())}
        >
          Start game for {readyPlayerCount} people
        </Button>
      )}
    </div>
  );
}
