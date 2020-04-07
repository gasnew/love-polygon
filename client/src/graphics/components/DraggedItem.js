// @flow

import React from 'react';
import { useDragLayer } from 'react-dnd';

import Item from './Item';
import {
  getSlotDimensions,
  getSlotScale,
  getToken,
} from '../../state/getters';

export default function DragLayerComponent() {
  const { isDragging, item, offset } = useDragLayer(monitor => ({
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    offset: monitor.getClientOffset(),
    isDragging: !!monitor.isDragging(),
  }));
  return (
    isDragging &&
    offset && (
      <div
        style={{
          position: 'absolute',
          ...getSlotDimensions(),
          left: offset.x - (window.innerWidth * getSlotScale()) / 200,
          top: offset.y - (window.innerWidth * (getSlotScale() + 10)) / 200,
          pointerEvents: 'none',
        }}
      >
        <Item token={getToken(item.id)} />
      </div>
    )
  );
}
