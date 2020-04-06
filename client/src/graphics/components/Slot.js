// @flow

import Color from 'color';
import _ from 'lodash';
import React, { useState } from 'react';
import { useDrop } from 'react-dnd';
import type { Item as DndItem, Monitor } from 'react-dnd';

import { useInterval } from './CountdownTimer';
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
  imageColorFilter,
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

function Plate({
  color,
  enabled,
  hover,
  other,
}: {
  color: string,
  enabled: boolean,
  hover: boolean,
  other?: boolean,
}) {
  const [glowIndex, setGlowIndex] = useState(0);
  useInterval(() => setGlowIndex((glowIndex + 1) % 3), 83);

  return (
    <div
      style={{
        ...getSlotDimensions(),
        position: 'absolute',
      }}
    >
      <img
        alt="I am delicious plate"
        style={{
          ...getSlotDimensions(),
          position: 'absolute',
        }}
        src="plate.png"
      />
      <img
        alt="I am delicious plate"
        style={{
          ...getSlotDimensions(),
          position: 'absolute',
          filter: imageColorFilter(
            Color({ r: 255, g: 163, b: 152 }),
            Color(color)
              .darken(enabled ? 0.08 : 0.3)
              .lighten(hover ? 0.1 : 0)
          ),
        }}
        src="rim.png"
      />
      {other && (
        <img
          alt="I am delicious plate"
          style={{
            ...getSlotDimensions(),
            position: 'absolute',
            filter: imageColorFilter(
              Color({ r: 255, g: 163, b: 152 }),
              Color(color)
                .darken(enabled ? 0.08 : 0.3)
            ),
          }}
          src={`glow${glowIndex}.png`}
        />
      )}
    </div>
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
  const color = otherPlayerId ? getPlayer(otherPlayerId).color : player.color;
  const token = getNodeToken(node.id);

  const [{ isOver, item }, drop] = useDrop(
    makeUseDropOptions(node, token)
  );

  return (
    <div style={{...getSlotDimensions(), position: 'relative'}}>
      <div
        style={{
          position: 'absolute',
          height: '200%',
          width: '200%',
          left: '-50%',
          top: '-50%',
        }}
      >
        <Ring
          color={Color(color).darken(0.2).hex()}
          hover={isOver}
          holdingItem={!!token && (item || {}).id !== token.id}
        />
      </div>
      <div
        ref={drop}
        style={{
          height: '100%',
          width: '100%',
          marginLeft: 'auto',
          marginRight: 'auto',
          display: 'flex',
          flexDirection: 'row',
          position: 'absolute',
        }}
      >
        <Plate
          color={color}
          enabled={node.enabled}
          hover={isOver}
          other={!!otherPlayerId}
        />
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
    </div>
  );
}
