// @flow

import axios from 'axios';
import copy from 'copy-to-clipboard';
import React, { useEffect, useRef, useState } from 'react';
import urljoin from 'url-join';

import getEnv from '../../env';
import DraggedItem from './DraggedItem';
import Lobby from './Lobby';
import NavigationBar from './NavigationBar';
import ResultsTable from './ResultsTable';
import Romance from './Romance';
import TrueLoveVoting from './TrueLoveVoting';
import VotingBallot from './VotingBallot';
import { getPhase } from '../../state/getters';
import { useGameState } from '../../state/state';

import { getInRound, getSessionInfo } from '../../state/getters';
import type { Phase } from '../../../../server/networkTypes';

// Mercilessly ripped from https://usehooks.com/useEventListener/, which
// itself appears to be somewhat of a rip from Abramov's useInterval...
function useEventListener(eventName, handler, element = window) {
  // Create a ref that stores handler
  const savedHandler = useRef();

  // Update ref.current value if handler changes.
  // This allows our effect below to always get latest handler without us
  // needing to pass it in effect deps array and potentially cause effect to
  // re-run every render.
  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(
    () => {
      // Make sure element supports addEventListener
      // On
      const isSupported = element && element.addEventListener;
      if (!isSupported) return;

      // Create event listener that calls handler function stored in ref
      const eventListener = event =>
        savedHandler.current && savedHandler.current(event);

      // Add event listener
      element.addEventListener(eventName, eventListener);

      // Remove event listener on cleanup
      return () => {
        element.removeEventListener(eventName, eventListener);
      };
    },
    [eventName, element] // Re-run if eventName or element changes
  );
}

const Scene = ({ phase }: { phase: Phase }) => {
  const slotLists = {
    lobby: <Lobby />,
    romance: <Romance phase={phase} />,
    countdown: <Romance phase={phase} />,
    finished: <Romance phase={phase} />,
    voting: <VotingBallot />,
    trueLove: <TrueLoveVoting />,
    results: <ResultsTable />,
  };
  if (slotLists[phase.name])
    return (
      <div className="fullheight">
        <div style={{ height: '100%' }}>
          {getInRound() ? slotLists[phase.name] : slotLists['lobby']}
        </div>
        <DraggedItem />
      </div>
    );
  return <p>No scene defined for {phase.name}</p>;
};

export default function Table() {
  useGameState();
  const [showDebugTools, setShowDebugTools] = useState(false);

  useEventListener(
    'keydown',
    ({ key }) => key === 'h' && setShowDebugTools(!showDebugTools)
  );

  const phase = getPhase();
  const { sessionId } = getSessionInfo();
  if (!phase) return <div>Loading, my dudes (no phase)...</div>;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          flex: '0 1 auto',
          zIndex: 1,
        }}
      >
        <NavigationBar />
      </div>
      <div
        style={{
          flex: '1 1 auto',
          zIndex: 0,
          overflow: 'scroll',
        }}
      >
        <div style={{ height: showDebugTools ? '95%' : '100%' }}>
          <Scene phase={phase} />
        </div>
        {showDebugTools && (
          <div style={{ height: '5%' }}>
            <button
              onClick={() =>
                axios
                  .post(urljoin(getEnv('API_URL'), 'api/get-server-state'), {
                    sessionId,
                  })
                  .then(response => copy(JSON.stringify(response.data)))
              }
            >
              Server state -> clipboard
            </button>
            <button
              onClick={() =>
                axios.post(
                  urljoin(getEnv('API_URL'), 'api/load-session-from-cache'),
                  { sessionId }
                )
              }
            >
              Load session from cache
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
