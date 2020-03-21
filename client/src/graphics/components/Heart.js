// @flow

import React from 'react';

import { getNode, getPlayer } from '../../state/getters';
import { TOKEN_DIMENSIONS } from './Item';

import type { Token } from '../../state/state';

type Props = {
  token: Token,
  style: { [string]: any },
};

export default function Heart({ token, style }: Props) {
  const playerName = getPlayer(getNode(token.nodeId).playerIds[0]).name;

  return (
    <div
      style={{
        ...TOKEN_DIMENSIONS,
        ...style,
        textAlign: 'center',
        backgroundImage: 'url(heart.png)',
        backgroundSize: 'cover',
      }}
    >
      <span style={{position: 'relative', top: 15 }}>{playerName}</span>
    </div>
  );
}
