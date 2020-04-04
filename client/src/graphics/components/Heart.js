// @flow

import Color from 'color';
import React from 'react';
import Typography from '@material-ui/core/Typography';

import {
  getNode,
  getPlayer,
  getTokenDimensions,
  imageColorFilter,
} from '../../state/getters';

import type { Token } from '../../state/state';

type Props = {
  token: Token,
  style?: { [string]: any },
};

export default function Heart({ token, style = {} }: Props) {
  const player = getPlayer(getNode(token.nodeId).playerIds[0]);

  const heartImageColor = Color({ r: 255, g: 163, b: 152 });
  return (
    <div
      style={{
        ...getTokenDimensions(),
        ...style,
        backgroundImage: 'url(heart.png)',
        backgroundSize: 'cover',
        filter: imageColorFilter(heartImageColor, Color(player.color)),
        display: 'flex',
        textAlign: 'center',
      }}
    >
      <Typography
        style={{
          width: '80%',
          margin: 'auto',
          position: 'relative',
          left: -3,
          overflow: 'hidden',
          color: heartImageColor.darken(0.5).hex(),
          fontSize: 10,
          wordBreak: 'break-word',
        }}
      >
        <b>{player.name.toUpperCase()}</b>
      </Typography>
    </div>
  );
}
