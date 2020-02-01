// @flow

import axios from 'axios';
import copy from 'copy-to-clipboard';
import React, { useEffect } from 'react';
import { isMobile } from 'react-device-detect';
import { DndProvider } from 'react-dnd';
import TouchBackend from 'react-dnd-touch-backend-cjs';
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

  const providerProps = isMobile
    ? { backend: TouchBackend }
    : {
        backend: MultiBackend,
        options: HTML5toTouch,
      };

  return (
    <DndProvider {...providerProps}>
      <Table />
      <button
        onClick={() =>
          axios
            .post('api/get-server-state', { sessionId: sessionInfo.sessionId })
            .then(response => copy(JSON.stringify(response.data)))
        }
      >
        Server state -> clipboard
      </button>
      <button
        onClick={() =>
          axios.post('api/load-session-from-cache', {
            sessionId: sessionInfo.sessionId,
          })
        }
      >
        Load session from cache
      </button>
    </DndProvider>
  );
}
