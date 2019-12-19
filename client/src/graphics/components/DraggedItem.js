// @flow

import React from 'react';
import { useDragLayer } from 'react-dnd';

import Item from './Item';
import { getToken } from '../../state/getters';

export default function DragLayerComponent() {
  const { currentOffset, isDragging, item } = useDragLayer(monitor => ({
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    currentOffset: monitor.getSourceClientOffset(),
    isDragging: !!monitor.isDragging(),
  }));
  return (
    isDragging && currentOffset && (
      <Item
        token={getToken(item.id)}
        style={{
          position: 'absolute',
          left: currentOffset.x,
          top: currentOffset.y,
          pointerEvents: 'none',
        }}
      />
    )
  );
}
