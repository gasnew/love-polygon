// @flow

import React from 'react';
import { DragPreviewImage, useDrag, useDragLayer } from 'react-dnd';

import Item from './Item';
import { getToken } from '../../state/getters';
import { toRGB } from '../graphics';
import { buildCircleMesh } from '../meshes';
import type { Component } from './index';
import type { Token } from '../../state/state';

export default function DragLayerComponent() {
  const { currentOffset, isDragging, item } = useDragLayer(monitor => ({
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    currentOffset: monitor.getSourceClientOffset(),
    isDragging: !!monitor.isDragging(),
  }));
  return (
    isDragging && (
      <Item
        token={getToken(item.id)}
        style={{
          position: 'absolute',
          left: currentOffset.x,
          top: currentOffset.y,
        }}
      />
    )
  );
}
