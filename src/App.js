// @flow

import React, { Component } from 'react';
import getRendererElement from './renderer';

class App extends Component<{}> {
  rootElement: ?HTMLDivElement;

  componentDidMount() {
    if (this.rootElement) this.rootElement.appendChild(getRendererElement());
  }

  render() {
    return <div ref={element => (this.rootElement = element)} />;
  }
}

export default App;
