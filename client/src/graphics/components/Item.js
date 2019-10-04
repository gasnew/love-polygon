// @flow

import React from 'react';
import { useDrag, useDragLayer } from 'react-dnd';

import type { Token } from '../../state/state';

const TOKEN_DIMENSIONS = { width: '90px', height: '90px' };
const TOKEN = 'token';

type Props = {
  token: Token,
  style: { [string]: any },
};

export default function Item({ token, style }: Props) {
  const [{ isDragging }, drag] = useDrag({
    item: { id: token.id, type: TOKEN },
    collect: monitor => ({
      isDragging: !!monitor.isDragging(),
      currentOffset: monitor.getDifferenceFromInitialOffset(),
    }),
  });
  return (
    !isDragging && (
      <img
        ref={drag}
        style={{
          ...TOKEN_DIMENSIONS,
          ...style,
        }}
        src="https://previews.123rf.com/images/imagestore/imagestore1606/imagestore160600288/57800504-devil-s-cake-slice-on-white-background.jpg"
      />
    )
  );
}
