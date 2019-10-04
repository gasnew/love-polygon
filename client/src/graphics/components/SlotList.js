// @flow

import _ from 'lodash';
import React from 'react';

import Slot from './Slot';
import type { Nodes } from '../../state/state';

type Props = {
  nodes: Nodes,
};

export default function SlotList({ nodes }: Props) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
      }}
    >
      {_.map(nodes, node => (
        <div
          key={node.id}
          style={{
            margin: 'auto',
            position: 'relative',
          }}
        >
          <Slot node={node} />
        </div>
      ))}
    </div>
  );
}
