// @flow

import React, { Component } from 'react';
import touches from 'touches';

import { beginDrag, continueDrag, endDrag } from './actions';
import render from './renderer';
import generateState from './state';

class App extends Component<{}> {
  componentDidMount() {
    window.state = generateState();
    touches()
      .on('start', beginDrag)
      .on('move', continueDrag)
      .on('end', endDrag);
    render();
  }

  render() {
    return <div />;
  }
}

export default App;
