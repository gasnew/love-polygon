// @flow

import Typography from '@material-ui/core/Typography';
import React from 'react';

import { getPlayer } from '../../state/getters';

type Props = {
  playerId: string,
};

export default function NameTag({ playerId }: Props) {
  const player = getPlayer(playerId);
  return (
    <Typography
      style={{ backgroundColor: player.color, padding: 5, borderRadius: 7 }}
      component="span"
    >
      {player.name || <i>New Player</i>}
    </Typography>
  );
}
