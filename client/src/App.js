// @flow

import React, { useState } from 'react';
import queryString from 'query-string';

import Game from './Game';
import LandingPage from './LandingPage';

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
