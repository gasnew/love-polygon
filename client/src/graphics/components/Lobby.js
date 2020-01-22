// @flow

import _ from 'lodash';
import React from 'react';

import SlotList from './SlotList';
import { getOwnNodes } from '../../state/getters';

export default function Lobby() {
  const nodes = getOwnNodes();
  const loveBucket = _.pickBy(nodes, ['type', 'loveBucket']);
  const storageNodes = _.pickBy(nodes, ['type', 'storage']);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '70%',
      }}
    >
      <div>
        <SlotList nodes={loveBucket} />
      </div>
      <div>
        <SlotList nodes={storageNodes} />
      </div>
    </div>
  );
}
