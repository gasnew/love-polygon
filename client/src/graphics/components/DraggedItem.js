// @flow

import React from 'react';
import { useDragLayer } from 'react-dnd';

import Item, { TOKEN_DIMENSIONS } from './Item';
import { getToken } from '../../state/getters';

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
          left: offset.x - TOKEN_DIMENSIONS.width / 2,
          top: offset.y - TOKEN_DIMENSIONS.height / 2,
          pointerEvents: 'none',
        }}
      />
    )
  );
}
