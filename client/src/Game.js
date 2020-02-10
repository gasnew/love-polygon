// @flow

import React, { useEffect } from 'react';
import { isMobile } from 'react-device-detect';
import { DndProvider } from 'react-dnd';
import TouchBackend from 'react-dnd-touch-backend';
import MultiBackend from 'react-dnd-multi-backend';
import HTML5toTouch from 'react-dnd-multi-backend/lib/HTML5toTouch';
import io from 'socket.io-client';
import uniqid from 'uniqid';

import Table from './graphics/components/Table';
import {
  setState,
  socketConnect,
  socketDisconnect,
  updateState,
} from './network/socket';
import dispatch, { setSocket } from './state/actions';
import generateState from './state/state';

type Props = {|
  sessionId: string,
|};

export default function Game({ sessionId }: Props) {
  const stored = name => window.sessionStorage.getItem(name);
  const playerId =
    (stored('sessionId') === sessionId && stored('playerId')) || uniqid();
  window.sessionStorage.setItem('sessionId', sessionId);
  window.sessionStorage.setItem('playerId', playerId);
  window.state = generateState({
    sessionId,
    playerId,
    playerName: '',
  });

  useEffect(() => {
    const socket = io('', { query: { sessionId, playerId } });
    socket
      .on('connect', socketConnect)
      .on('updateState', updateState)
      .on('setState', setState)
      .on('disconnect', socketDisconnect);
    dispatch(setSocket(socket));
    return () => {
      socket.disconnect();
    };
  });

  const providerProps = isMobile
    ? { backend: TouchBackend }
    : {
        backend: MultiBackend,
        options: HTML5toTouch,
      };

  return (
    <DndProvider {...providerProps}>
      <Table />
    </DndProvider>
  );
}
