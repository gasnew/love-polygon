// @flow

import React from 'react';

import { getPlayer } from '../../state/getters';

type Props = {
  playerId: string,
};

export default function NameTag({ playerId }: Props) {
  const player = getPlayer(playerId);
  return (
    <span
      style={{ backgroundColor: player.color, padding: 5, borderRadius: 7 }}
    >
      {player.name || <i>New Player</i>}
    </span>
  );
}
