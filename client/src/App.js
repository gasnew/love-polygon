// @flow

import React, { Component } from 'react';

import Game from './Game';
import LandingPage from './LandingPage';
import type { Session } from './state';

type Props = {};

type State = {|
  session: ?Session,
|};

class App extends Component<Props, State> {
  state = {
    session: {
      id: 'abcd',
      name: 'hahahah',
    },
  };

  render() {
    const setSession = (session: Session) => this.setState(() => ({ session }));
    const exitSession = () => this.setState(() => ({ session: null }));

    return this.state.session ? (
      <Game session={this.state.session} exitSession={exitSession} />
    ) : (
      <LandingPage setSession={setSession} />
    );
  }
}

export default App;
