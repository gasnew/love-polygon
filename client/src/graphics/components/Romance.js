// @flow

import _ from 'lodash';
import React from 'react';

import SlotList from './SlotList';
import { getOwnNodes } from '../../state/getters';

export default function Romance() {
  const nodes = getOwnNodes();
  const sharedNodes = _.pickBy(nodes, ['type', 'shared']);
  const storageNodes = _.pickBy(nodes, ['type', 'storage']);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
      }}
    >
      <div>
        <SlotList nodes={sharedNodes} />
      </div>
      <div>
        <SlotList nodes={storageNodes} />
      </div>
    </div>
  );
}
