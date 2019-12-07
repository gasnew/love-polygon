// @flow

import React, { useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import MultiBackend from 'react-dnd-multi-backend';
import HTML5toTouch from 'react-dnd-multi-backend/lib/HTML5toTouch';
import io from 'socket.io-client';

import Table from './graphics/components/Table';
import {
  setState,
  socketConnect,
  socketDisconnect,
  updateState,
} from './network/socket';
import dispatch, { setSocket } from './state/actions';
import generateState from './state/state';
import type { SessionInfo } from '../../server/networkTypes';

type Props = {|
  sessionInfo: SessionInfo,
  exitSession: () => void,
|};

export default function Game({ sessionInfo, exitSession }: Props) {
  window.state = generateState(sessionInfo);

  useEffect(() => {
    const socket = io('', { query: sessionInfo });
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

  return (
    <DndProvider backend={MultiBackend} options={HTML5toTouch}>
      <Table  />
    </DndProvider>
  );
}
