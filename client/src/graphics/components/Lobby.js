// @flow

import _ from 'lodash';
import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';

import PlayerList from './PlayerList';
import SlotList from './SlotList';
import { NAME_LIMIT } from '../../constants';
import dispatch, { setPlayerName } from '../../state/actions';
import announce, {
  setName as networkedSetName,
  startGame,
} from '../../network/network';
import {
  getLoveBuckets,
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
  const [dialogOpen, setDialogOpen] = useState(!!!playerName);
  const [nameError, setNameError] = useState('');

  const ownNodes = getOwnNodes();
  const tokens = getTokens();
  const loveBucket = _.find(ownNodes, ['type', 'loveBucket']);

  if (!loveBucket) return <div>Loading, my dudes...</div>;

  const loveBuckets = getLoveBuckets();
  const storageNodes = _.pickBy(ownNodes, ['type', 'storage']);

  const readyPlayerCount = _.filter(
    getTokens(),
    token => loveBuckets[token.nodeId]
  ).length;
  const handleNameInput = event => {
    const name = event.target.value;
    const truncatedName = name.substring(0, NAME_LIMIT);
    dispatch(setPlayerName(playerId, truncatedName));
    throttledNetworkedSetName(truncatedName);
    setNameError('');
  };
  const handleDialogClose = () =>
    playerName ? setDialogOpen(false) : setNameError('Please enter a name');
  const handleConfirmName = () => {
    playerName && announce(networkedSetName(playerName));
    handleDialogClose();
  };
  const heartIsInBucket = _.some(tokens, ['nodeId', loveBucket.id]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        height: '100%',
        width: '100%',
      }}
    >
      <div style={{ flexBasis: '30%', top: '20%', position: 'relative' }}>
        <PlayerList />
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          flexBasis: '70%',
          height: '100%',
          width: '100%',
        }}
      >
        <div>
          <SlotList nodes={{ [loveBucket.id]: loveBucket }} />
        </div>
        <div>
          <SlotList nodes={storageNodes} />
        </div>
        <Button
          color="primary"
          variant="contained"
          onClick={() => setDialogOpen(true)}
          disabled={heartIsInBucket}
        >
          Change name
        </Button>
        {playerId === getPartyLeader() && (
          <Button
            variant="contained"
            color="primary"
            onClick={() => announce(startGame())}
          >
            Start game for {readyPlayerCount} people
          </Button>
        )}
        <Dialog open={dialogOpen} onClose={handleDialogClose}>
          <DialogTitle id="alert-dialog-title">
            Please enter your name
          </DialogTitle>
          <DialogContent>
            <TextField
              label="Name"
              value={playerName}
              onChange={handleNameInput}
              margin="normal"
              variant="outlined"
              error={!!nameError}
              helperText={nameError}
              onKeyPress={({ key }) => {
                if (key === 'Enter') handleConfirmName();
              }}
              autoFocus
            />
          </DialogContent>
          <DialogActions>
            <Button
              variant="contained"
              color="primary"
              onClick={handleConfirmName}
            >
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
}
