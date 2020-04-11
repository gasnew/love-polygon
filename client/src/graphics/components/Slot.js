// @flow

import Color from 'color';
import _ from 'lodash';
import React from 'react';
import { useDrop } from 'react-dnd';
import type { Item as DndItem, Monitor } from 'react-dnd';

import Item, { TOKEN } from './Item';
import Ring from './Ring';
import announce, {
  swapTokens,
  transferToken as networkedTransferToken,
} from '../../network/network';
import dispatch, { setTokenNodeId, transferToken } from '../../state/actions';
import {
  getNodeToken,
  getPlayer,
  getSessionInfo,
  getSlotDimensions,
  getToken,
} from '../../state/getters';
import type { Node, Token } from '../../state/state';

export const makeUseDropOptions = (node: Node, token: ?Token) => ({
  accept: TOKEN,
  drop: (item: DndItem) => {
    const draggedToken = getToken(item.id);
    if (draggedToken.nodeId === node.id) return;
    if (token) {
      const previousNodeId = getToken(draggedToken.id).nodeId;
      dispatch(setTokenNodeId(draggedToken.id, node.id));
      dispatch(setTokenNodeId(token.id, previousNodeId));
      announce(swapTokens(draggedToken.id, previousNodeId, token.id, node.id));
    } else {
      announce(
        networkedTransferToken(draggedToken.id, draggedToken.nodeId, node.id)
      );
      dispatch(transferToken(draggedToken.id, draggedToken.nodeId, node.id));
    }
  },
  collect: (monitor: Monitor) => ({
    isOver: !!monitor.isOver({ shallow: false }),
    item: monitor.getItem(),
  }),
});

type Props = {
  node: Node,
};

export default function Slot({ node }: Props) {
  const { playerId } = getSessionInfo();
  const player = getPlayer(playerId);
  const otherPlayerId =
    node.playerIds.length === 2 &&
    _.find(node.playerIds, id => id !== playerId);
  const color = otherPlayerId ? getPlayer(otherPlayerId).color : player.color;
  const token = getNodeToken(node.id);

  const [{ isOver, item }, drop] = useDrop(makeUseDropOptions(node, token));

  return (
    <div style={{ ...getSlotDimensions(), position: 'relative' }}>
      <div
        style={{
          position: 'absolute',
          height: '200%',
          width: '200%',
          left: '-50%',
          top: '-50%',
          pointerEvents: 'none',
        }}
      >
        <Ring
          color={Color(color)
            .darken(0.2)
            .hex()}
          hover={isOver}
          holdingItem={!!token && (item || {}).id !== token.id}
          isDragging={!!item}
        />
      </div>
      {token && (
        <div
          style={{
            height: '100%',
            width: '100%',
            marginLeft: 'auto',
            marginRight: 'auto',
            bottom: '20%',
            display: 'flex',
            flexDirection: 'row',
            position: 'absolute',
            pointerEvents: item ? 'none' : 'auto',
          }}
        >
          <Item token={token} />
        </div>
      )}
      <div
        ref={drop}
        style={{
          position: 'absolute',
          height: '100%',
          width: '100%',
          pointerEvents: item ? 'auto' : 'none',
        }}
      />
    </div>
  );
}
