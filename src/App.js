import React, { Component } from 'react';
import getRendererElement from './renderer';

class App extends Component {
  componentDidMount() {
    this.rootElement.appendChild(getRendererElement());
  }

  render() {
    return <div ref={element => (this.rootElement = element)} />;
  }
}

export default App;
