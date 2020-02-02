// @flow

import React, { useState } from 'react';
import { Router, Route, Switch } from 'react-router';
import queryString from 'query-string';

import Game from './Game';
import LandingPage from './LandingPage';
import type { SessionInfo } from '../../server/networkTypes';

type Props = {};

const DEBUG_SESSION = {
  sessionId: 'dep',
  playerId: 'sktwij7rk5yjyxif',
  playerName: 'G',
};

function App() {
  const [sessionId, setSessionId] = useState(
    queryString.parse(window.location.search)['sessionId']
  );

  return sessionId ? (
    <Game sessionId={sessionId} />
  ) : (
    <LandingPage setSessionId={setSessionId} />
  );
}

export default App;
