// @flow

import React from 'react';

import { TOKEN_DIMENSIONS } from './Item';

import type { Token } from '../../state/state';

type Props = {
  token: Token,
  style: { [string]: any },
};

export default function Heart({ token, style }: Props) {
  return (
    <img
      alt="I am a beautiful heart"
      style={{
        ...TOKEN_DIMENSIONS,
        ...style,
      }}
      src="heart.png"
    />
  );
}
