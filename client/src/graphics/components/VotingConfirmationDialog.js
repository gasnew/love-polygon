// @flow

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import React from 'react';

type Props = {
  open: boolean,
  onClose: () => void,
  onAccept: () => void,
  playerName: string,
  selectedNames: string,
};

export default function VotingConfirmationDialog({
  open,
  onClose,
  onAccept,
  playerName,
  selectedNames,
}: Props) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        Double-check with <b>{playerName}</b>!
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          Is this the exact set of people {playerName} believes have a crush on
          them?
          <b>{selectedNames}</b>
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary" autoFocus>
          Back
        </Button>
        <Button onClick={onAccept} color="primary" variant="contained">
          Yep!
        </Button>
      </DialogActions>
    </Dialog>
  );
}
