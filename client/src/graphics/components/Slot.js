// @flow

import Color from 'color';
import _ from 'lodash';
import React from 'react';
import { useDrop } from 'react-dnd';
import type { Item as DndItem, Monitor } from 'react-dnd';

import Item, { TOKEN } from './Item';
import NameTag from './NameTag';
import announce, {
  swapTokens,
  transferToken as networkedTransferToken,
} from '../../network/network';
import dispatch, { setTokenNodeId, transferToken } from '../../state/actions';
import {
  getNodeToken,
  getPlayer,
  getSessionInfo,
  getToken,
  imageColorFilter,
} from '../../state/getters';
import type { Node, Token } from '../../state/state';

const SLOT_DIMENSIONS = { width: '80px', height: '80px' };

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
  }),
});

function Plate({
  backgroundImage = 'url(plate.png)',
  color,
  enabled,
  hover,
}: {
  backgroundImage?: string,
  color: string,
  enabled: boolean,
  hover: boolean,
}) {
  return (
    <div
      style={{
        ...SLOT_DIMENSIONS,
        backgroundImage,
        backgroundSize: 'contain',
        position: 'absolute',
        filter: imageColorFilter(
          Color({ r: 255, g: 163, b: 152 }),
          Color(color)
            .darken(enabled ? 0.08 : 0.3)
            .lighten(hover ? 0.1 : 0)
        ),
      }}
    />
  );
}

type Props = {
  node: Node,
};

export default function Slot({ node }: Props) {
  const { playerId } = getSessionInfo();
  const player = getPlayer(playerId);
  const otherPlayerId =
    node.playerIds.length === 2 &&
    _.find(node.playerIds, id => id !== playerId);
  const token = getNodeToken(node.id);

  const [{ isOver }, drop] = useDrop(makeUseDropOptions(node, token));

  return (
    <div>
      <div
        ref={drop}
        style={{
          ...SLOT_DIMENSIONS,
          marginLeft: 'auto',
          marginRight: 'auto',
          display: 'flex',
          flexDirection: 'row',
        }}
      >
        <Plate color={player.color} enabled={node.enabled} hover={isOver} />
        {otherPlayerId && (
          <Plate
            backgroundImage="url(plate-half.png)"
            color={getPlayer(otherPlayerId).color}
            enabled={node.enabled}
            hover={isOver}
          />
        )}
        {token && (
          <Item
            token={token}
            style={{
              position: 'relative',
              marginLeft: 'auto',
              marginRight: 'auto',
              bottom: -10,
            }}
          />
        )}
      </div>
      <div style={{ textAlign: 'center', margin: 5 }}>
        {otherPlayerId && <NameTag playerId={otherPlayerId} />}
      </div>
    </div>
  );
}
