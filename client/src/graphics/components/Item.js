// @flow

import React from 'react';
import { useDrag } from 'react-dnd';

import Heart from './Heart';
import type { Token } from '../../state/state';

export const TOKEN_DIMENSIONS = { width: 60, height: 60 };
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
  const tokenType = token && token.type;
  return (
    !isDragging &&
    (tokenType === 'heart' ? (
      <div ref={drag}>
        <Heart
          token={token}
          style={{
            ...TOKEN_DIMENSIONS,
            ...style,
          }}
        />
      </div>
    ) : (
      <img
        ref={drag}
        alt="I am a delicious food"
        style={{
          ...TOKEN_DIMENSIONS,
          ...style,
        }}
        src={IMAGES_URLS[tokenType]}
      />
    ))
  );
}
