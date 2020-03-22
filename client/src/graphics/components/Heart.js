// @flow

import Color from 'color';
import React from 'react';
import Typography from '@material-ui/core/Typography';

import { getNode, getPlayer } from '../../state/getters';
import { TOKEN_DIMENSIONS } from './Item';

import type { Token } from '../../state/state';

type Props = {
  token: Token,
  style: { [string]: any },
};

export default function Heart({ token, style }: Props) {
  const player = getPlayer(getNode(token.nodeId).playerIds[0]);

  const playerColor = Color(player.color);
  const heartImageColor = Color({ r: 255, g: 163, b: 152 });
  const hueRotation = playerColor.hue() - heartImageColor.hue();
  const colorBrightness =
    (playerColor.luminosity() - heartImageColor.luminosity() + 1) * 100;
  const saturation =
    playerColor.saturationl() - heartImageColor.saturationl() + 100;
  return (
    <div
      style={{
        ...TOKEN_DIMENSIONS,
        ...style,
        backgroundImage: 'url(heart.png)',
        backgroundSize: 'cover',
        filter: `hue-rotate(${hueRotation}deg) brightness(${colorBrightness}%) saturate(${saturation}%)`,
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
