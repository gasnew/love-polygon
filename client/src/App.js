// @flow

import React, { Component } from 'react';

import render from './renderer';
import type { Tokens } from './types';


let token = {x: -0.3, y: -0.2};
function onMouseMove(event) {
  // calculate mouse position in normalized device coordinates
  // (-1 to +1) for both components

  token.x = (event.clientX / window.innerWidth) * 2 - 1;
  token.y = -(event.clientY / window.innerHeight) * 2 + 1;
}
window.addEventListener('mousemove', onMouseMove, false);
class App extends Component<{}> {
  componentDidMount() {
    const tokens: Tokens = [
      token,
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
