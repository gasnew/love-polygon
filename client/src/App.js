// @flow

import React, { Component } from 'react';

import Game from './Game';
import LandingPage from './LandingPage';
import type { SessionInfo } from '../../server/networkTypes';

type Props = {};

type State = {|
  sessionInfo: ?SessionInfo,
|};

class App extends Component<Props, State> {
  state = {
    // This is a default ONLY for testing
    sessionInfo: {
      sessionId: 'jimmy',
      playerId: '2p8p4s8ogjvvidri2',
      playerName: 'Jimbo',
    },
    //sessionInfo: null
  };

  render() {
    const setSession = (sessionInfo: SessionInfo) =>
      this.setState(() => ({ sessionInfo }));
    const exitSession = () => this.setState(() => ({ sessionInfo: null }));

    return this.state.sessionInfo ? (
      <Game sessionInfo={this.state.sessionInfo} exitSession={exitSession} />
    ) : (
      <LandingPage setSession={setSession} />
    );
  }
}

export default App;
