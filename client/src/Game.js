// @flow

import React, { Component } from 'react';
import screenfull from 'screenfull';
import touches from 'touches';
import Button from '@material-ui/core/Button';

import { beginDrag, continueDrag, endDrag } from './input';
import render from './renderer';
import generateState from './state';
import type { Session } from './state';

type Props = {|
  session: Session,
  exitSession: () => void,
|};

type State = {|
  touchEmitter: any,
  start: () => void,
|};

export default class Game extends Component<Props, State> {
  element: ?HTMLDivElement;
  state = {
    touchEmitter: null,
    start: () => {
      const element = this.element;
      if (!element)
        throw new Error('Idk how, but this component aint mounted yet');
      //if (screenfull.isFullscreen) {
        window.state = generateState();

        const touchEmitter = touches();
        touchEmitter
          .on('start', beginDrag)
          .on('move', continueDrag)
          .on('end', endDrag);
        render(element);

        this.setState(() => ({ touchEmitter }));
      //} else this.props.exitSession();
    },
  };

  componentDidMount() {
    if (screenfull.enabled) {
      screenfull.on('change', this.state.start);
      this.state.start(); // Remove this for mobile
      //screenfull.request(this.element);
    } else {
      console.log('yuck, your browser does not support fullscreen mode');
    }
  }

  componentWillUnmount() {
    if (this.state.touchEmitter) this.state.touchEmitter.disable();
    screenfull.off('change', this.state.start);
  }

  render() {
    return (
      <div>
        {!screenfull.isFullscreen && (
          <Button onClick={() => screenfull.request(this.element)}>
            Activate maximum overdrive!
          </Button>
        )}
        <div ref={element => (this.element = element)} />
      </div>
    );
  }
}
