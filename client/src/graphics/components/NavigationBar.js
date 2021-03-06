// @flow

import copy from 'copy-to-clipboard';
import Snackbar from '@material-ui/core/Snackbar';
import Typography from '@material-ui/core/Typography';
import React, { useState } from 'react';

import NameTag from './NameTag';
import { getPhase, getRoundNumber, getSessionInfo } from '../../state/getters';
import type { PhaseName } from '../../../../server/networkTypes';

// NOTE(gnewman): We have to declare this ourselves because content_copy is
// mysteriously absent from the material-ui package
const Copy = () => (
  <i className="material-icons" style={{ fontSize: 30 }}>
    content_copy
  </i>
);

const BACKGROUND_COLORS: { [PhaseName]: string } = {
  lobby: '#D4F9E5', // green
  romance: '#F7DEE0', // red
  countdown: '#c0564a', // red
  finished: '#c0564a', // red
  voting: '#CCDBE4', // blue
  trueLove: '#FDE7BF', // yellow
  results: '#D2CFD5', // purple
};

// TODO(gnewman): Support sharing once on https (or if navigator.share is
// becomes on non-secure hosts):
// https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share
export default function NavigationBar() {
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const { playerId, sessionId } = getSessionInfo();
  const phaseName = (getPhase() || {}).name;
  const roundNumber = getRoundNumber();

  const handleSnackbarClose = () => setSnackbarOpen(false);
  const handleCopy = () => {
    setSnackbarMessage('Room URL copied to clipboard');
    setSnackbarOpen(true);
    copy(window.location.href);
  };

  return (
    <div>
      <div
        style={{
          backgroundColor: BACKGROUND_COLORS[phaseName],
          transition: 'background-color 200ms linear',
        }}
      >
        <div style={{ width: '100%', display: 'flex', flexDirection: 'row' }}>
          <Typography style={{ margin: 10 }}>
            <NameTag playerId={playerId} />
          </Typography>
          <Typography style={{ margin: 'auto', marginTop: 10 }}>
            <b>
              Round {roundNumber}｜{phaseName}
            </b>
          </Typography>
          <Typography style={{ margin: 10, marginLeft: 'auto' }}>
            Room {sessionId}
          </Typography>
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          right: 0,
          margin: 5,
          opacity: 0.5,
        }}
      >
        <span onClick={handleCopy}>
          <Copy />
        </span>
      </div>
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
      />
    </div>
  );
}
