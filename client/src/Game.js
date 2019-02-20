// @flow

import React, { Component } from 'react';
import screenfull from 'screenfull';
import io from 'socket.io-client';
import touches from 'touches';
import Button from '@material-ui/core/Button';

import dispatch, { setSocket } from './actions';
import { beginDrag, continueDrag, endDrag } from './input';
import render from './renderer';
import {
  setState,
  socketConnect,
  socketDisconnect,
  updateState,
} from './socket';
import generateState from './state';
import type { Session } from './state';

type Props = {|
  session: Session,
  exitSession: () => void,
|};

type State = {|
  touchEmitter: any,
  socket: any,
  start: () => void,
|};

export default class Game extends Component<Props, State> {
  element: ?HTMLDivElement;
  state = {
    touchEmitter: null,
    socket: null,
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

      const socket = io({ query: { sessionId: 'blag', playerName: 'blorg' } });
      socket
        .on('connect', socketConnect)
        .on('updateState', updateState)
        .on('setState', setState)
        .on('disconnect', socketDisconnect);
      dispatch(setSocket(socket));

      render(element);

      this.setState(() => ({ touchEmitter, socket }));
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
    if (this.state.socket) this.state.socket.disconnect();
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
