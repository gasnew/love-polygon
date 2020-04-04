// @flow

import _ from 'lodash';
import React from 'react';

import Slot from './Slot';
import type { Node } from '../../state/state';

type Props = {
  nodes: Node[],
  arc?: boolean,
};

export default function SlotList({ nodes, arc = false }: Props) {
  const arcMargin = node =>
    100 *
    (1 - Math.sin(((nodes.indexOf(node) + 0.5) / nodes.length) * Math.PI));
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
            marginLeft: 'auto',
            marginRight: 'auto',
            position: 'relative',
            marginTop: arc ? arcMargin(node) : 0,
          }}
        >
          <Slot node={node} />
        </div>
      ))}
    </div>
  );
}
