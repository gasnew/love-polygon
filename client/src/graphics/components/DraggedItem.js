// @flow

import React from 'react';
import { useDragLayer } from 'react-dnd';

import Item from './Item';
import { getToken, getTokenScale } from '../../state/getters';

export default function DragLayerComponent() {
  const { isDragging, item, offset } = useDragLayer(monitor => ({
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    offset: monitor.getClientOffset(),
    isDragging: !!monitor.isDragging(),
  }));
  return (
    isDragging && offset && (
      <Item
        token={getToken(item.id)}
        style={{
          position: 'absolute',
          left: offset.x - window.innerWidth * getTokenScale() / 200,
          top: offset.y - window.innerWidth * getTokenScale() / 200,
          pointerEvents: 'none',
        }}
      />
    )
  );
}
