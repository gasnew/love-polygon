// @flow

import React from 'react';
import { useDrag } from 'react-dnd';

import type { Token } from '../../state/state';

const TOKEN_DIMENSIONS = { width: '60px', height: '60px' };
export const TOKEN = 'token';
const IMAGES_URLS = {
  heart: 'heart.png',
  cookie: 'cookie.png',
  cake: 'cake.png',
  candy: 'candy.png',
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
    }),
  });
  return (
    !isDragging && (
      <img
        ref={drag}
        alt="I am a delicious food"
        style={{
          ...TOKEN_DIMENSIONS,
          ...style,
        }}
        src={IMAGES_URLS[token && token.type]}
      />
    )
  );
}
