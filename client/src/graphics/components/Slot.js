// @flow

import _ from 'lodash';
import React from 'react';
import { useDrop } from 'react-dnd';

import Item, { TOKEN } from './Item';
import announce, { transferToken } from '../../network/network';
import dispatch, { setTokenNodeId } from '../../state/actions';
import {
  getNodeToken,
  getPlayers,
  getSessionInfo,
  getToken,
} from '../../state/getters';
import type { Node } from '../../state/state';

const SLOT_DIMENSIONS = { width: '200px', height: '200px' };

type Props = {
  node: Node,
};

export default function Slot({ node }: Props) {
  const [collectedProps, drop] = useDrop({
    accept: TOKEN,
    drop: item => {
      const token = getToken(item.id);
      if (token.nodeId === node.id) return;
      announce(transferToken(token.id, token.nodeId, node.id));
      dispatch(setTokenNodeId(token.id, node.id));
    },
    collect: monitor => ({
      isOver: !!monitor.isOver(),
    }),
  });

  const token = getNodeToken(node.id);

  return (
    <div>
      <img
        ref={drop}
        style={{
          ...SLOT_DIMENSIONS,
        }}
        src="https://image.shutterstock.com/image-vector/white-dish-plate-isolated-on-260nw-1054819865.jpg"
      />
      {token && (
        <Item
          token={token}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            marginLeft: 'auto',
            marginRight: 'auto',
            top: 0,
            bottom: 0,
            marginTop: 'auto',
            marginBottom: 'auto',
          }}
        />
      )}
    </div>
  );
}
