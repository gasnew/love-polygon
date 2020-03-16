// @flow

import _ from 'lodash';
import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';

import SeriesInfoCard from './SeriesInfoCard';
import Jar from './Jar';
import SlotList from './SlotList';
import { NAME_LIMIT } from '../../constants';
import dispatch, { setPlayerName } from '../../state/actions';
import announce, {
  setName as networkedSetName,
  startGame,
} from '../../network/network';
import { getOwnNodes, getSessionInfo, getTokens } from '../../state/getters';

type NameDialogProps = {
  playerName: string,
  handlePlayerNameChange: string => void,
  open: boolean,
  onClose: () => void,
};

const NameDialog = ({
  playerName,
  handlePlayerNameChange,
  open,
  onClose,
}: NameDialogProps) => {
  const [nameError, setNameError] = useState('');

  const handleNameInput = event => {
    handlePlayerNameChange(event.target.value);
    setNameError('');
  };
  const handleDialogClose = () =>
    playerName ? onClose() : setNameError('Please enter a name');
  const handleConfirmName = () => {
    playerName && announce(networkedSetName(playerName));
    handleDialogClose();
  };
  return (
    <Dialog onClose={handleDialogClose} open={open}>
      <DialogTitle id="alert-dialog-title">Please enter your name</DialogTitle>
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
        <Button variant="contained" color="primary" onClick={handleConfirmName}>
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const throttledNetworkedSetName = _.throttle(
  name => announce(networkedSetName(name)),
  1000
);

export default function Lobby() {
  const { playerId, playerName } = getSessionInfo();
  const [dialogOpen, setDialogOpen] = useState(!!!playerName);

  if (playerName == null) return <div>One sec, lads</div>;

  const ownNodes = getOwnNodes();
  const tokens = getTokens();
  const loveBucket = _.find(ownNodes, ['type', 'loveBucket']);

  if (!loveBucket) return <div>Loading, my dudes...</div>;

  const storageNodes = _.pickBy(ownNodes, ['type', 'storage']);

  const heartIsInBucket = _.some(tokens, ['nodeId', loveBucket.id]);

  const handlePlayerNameChange = name => {
    const truncatedName = name.substring(0, NAME_LIMIT);
    dispatch(setPlayerName(playerId, truncatedName));
    throttledNetworkedSetName(truncatedName);
  };

  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          height: '100%',
          width: '100%',
          flexBasis: '60%',
          display: 'flex',
          flexDirection: 'row',
        }}
      >
        <div style={{ marginTop: '20%', flexBasis: '40%' }}>
          <SeriesInfoCard onClick={() => announce(startGame())} />
        </div>
        <div style={{ flexBasis: '60%' }}>
          <Jar node={loveBucket} />
        </div>
      </div>
      <div
        style={{
          height: '100%',
          width: '100%',
          flexBasis: '40%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
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
        <NameDialog
          playerName={playerName}
          handlePlayerNameChange={handlePlayerNameChange}
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
        />
      </div>
    </div>
  );
}
