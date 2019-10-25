// @flow

import React, { useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import TouchBackend from 'react-dnd-touch-backend';
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
    <DndProvider backend={TouchBackend}>
      <Table  />
    </DndProvider>
  );
}
