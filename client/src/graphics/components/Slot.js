// @flow

import React from 'react';
import { useDrop } from 'react-dnd';

import Item, { TOKEN } from './Item';
import announce, {
  swapTokens,
  transferToken as networkedTransferToken,
} from '../../network/network';
import dispatch, { setTokenNodeId, transferToken } from '../../state/actions';
import { getNodeToken, getToken } from '../../state/getters';
import type { Node } from '../../state/state';

const SLOT_DIMENSIONS = { width: '80px', height: '80px' };

type Props = {
  node: Node,
};

export default function Slot({ node }: Props) {
  const token = getNodeToken(node.id);

  const [, drop] = useDrop({
    accept: TOKEN,
    drop: item => {
      const draggedToken = getToken(item.id);
      if (draggedToken.nodeId === node.id) return;
      if (token) {
        const previousNodeId = getToken(draggedToken.id).nodeId;
        dispatch(setTokenNodeId(draggedToken.id, node.id));
        dispatch(setTokenNodeId(token.id, previousNodeId));
        announce(
          swapTokens(draggedToken.id, previousNodeId, token.id, node.id)
        );
      } else {
        announce(
          networkedTransferToken(draggedToken.id, draggedToken.nodeId, node.id)
        );
        dispatch(transferToken(draggedToken.id, draggedToken.nodeId, node.id));
      }
    },
    collect: monitor => ({
      isOver: !!monitor.isOver({ shallow: false }),
    }),
  });

  return (
    <div
      ref={drop}
      style={{
        ...SLOT_DIMENSIONS,
        ...(node.enabled ? {} : { filter: 'brightness(0.7)' }),
        backgroundImage:
          'url(https://image.shutterstock.com/image-vector/white-dish-plate-isolated-on-260nw-1054819865.jpg)',
        backgroundSize: 'cover',
      }}
    >
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
