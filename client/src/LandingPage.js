// @flow

import Button from '@material-ui/core/Button';
import React, { Component } from 'react';

import type { Session } from './state';

type Props = {
  setSession: (Session) => void,
};
type State = {|
  sessionId: ?string,
  playerName: ?string,
|};

export default class LandingPage extends Component<Props, State> {
  constructor() {
    super();
    this.state = { sessionId: null, playerName: null };
  }

  render() {
    const joinSession = () => {
      this.props.setSession({
        id: 'abcd',
        name: 'joe bob joe',
      });
    }

    return (
      <div>
        <Button variant="contained" color="primary" onClick={joinSession}>
          I'm a button, yo
        </Button>
      </div>
    );
  }
}
