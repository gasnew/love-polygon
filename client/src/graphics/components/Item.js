// @flow

import React from 'react';
import { useDrag, useDragLayer } from 'react-dnd';

import type { Token } from '../../state/state';

const TOKEN_DIMENSIONS = { width: '90px', height: '90px' };
export const TOKEN = 'token';
const IMAGES_URLS = {
  heart: 'https://pixy.org/src/74/thumbs350/749699.jpg',
  cookie:
    'https://previews.123rf.com/images/maxpayne222/maxpayne2221512/maxpayne222151200087/50509875-chocolate-chip-cookie-isolated-on-white-background.jpg',
  cake:
    'https://previews.123rf.com/images/imagestore/imagestore1606/imagestore160600288/57800504-devil-s-cake-slice-on-white-background.jpg',
  candy: 'https://d2gg9evh47fn9z.cloudfront.net/800px_COLOURBOX34133221.jpg',
};

type Props = {
  token: Token,
  style: { [string]: any },
};

export default function Item({ token, style }: Props) {
  const [{ isDragging }, drag] = useDrag({
    item: { id: token && token.id, type: TOKEN },
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
        src={IMAGES_URLS[token.type]}
      />
    )
  );
}
