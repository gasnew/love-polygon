// @flow

import Button from '@material-ui/core/Button';
import _ from 'lodash';
import React from 'react';
import TextField from '@material-ui/core/TextField';

import SlotList from './SlotList';
import dispatch, { setPlayerName } from '../../state/actions';
import announce, {
  setName as networkedSetName,
  startGame,
} from '../../network/network';
import {
  getPlayers,
  getNodes,
  getOwnNodes,
  getPartyLeader,
  getSessionInfo,
  getTokens,
} from '../../state/getters';

const throttledNetworkedSetName = _.throttle(
  name => announce(networkedSetName(name)),
  1000
);

export default function Lobby() {
  const { playerId, playerName } = getSessionInfo();
  const nodes = getOwnNodes();
  const loveBucket = _.pickBy(nodes, ['type', 'loveBucket']);
  const loveBuckets = _.pickBy(getNodes(), ['type', 'loveBucket']);
  const storageNodes = _.pickBy(nodes, ['type', 'storage']);

  const readyPlayerCount = _.filter(
    getTokens(),
    token => loveBuckets[token.nodeId]
  ).length;
  const handleNameInput = event => {
    const name = event.target.value;
    dispatch(setPlayerName(playerId, name));
    throttledNetworkedSetName(name);
  };

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
      <TextField
        label="Name"
        value={playerName}
        onChange={handleNameInput}
        margin="normal"
        variant="outlined"
      />
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
