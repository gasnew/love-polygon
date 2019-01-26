// @flow

import React, { Component } from 'react';

import render from './renderer';
import type { Tokens } from './types';

class App extends Component<{}> {
  componentDidMount() {
    const tokens: Tokens = [
      {
        x: -0.3,
        y: -0.2,
      },
      {
        x: 0.4,
        y: 0.6,
      },
    ];
    render({ tokens });
  }

  render() {
    return <div />;
  }
}

export default App;
