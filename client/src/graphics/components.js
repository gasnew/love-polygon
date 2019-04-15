// @flow

import type { Regl } from 'regl';

import {
  getOwnRelationship,
  getPlayers,
  getSessionInfo,
} from '../state/getters';
import { buildRect, buildText } from './visualObjects';
import draw, { cached } from './graphics';

export type Component<Props> = Props => void;

export function banner(regl: Regl): Component<void> {
  const drawRect = draw(buildRect(regl));
  const drawText = draw(cached(buildText(regl)));

  return () => {
    const relationship = getOwnRelationship();
    if (!relationship) return;
    const targetPlayer = getPlayers()[relationship.toId];
    const text = `You have a ${relationship.type} on ${targetPlayer.name}!`;

    drawText({ x: 30, y: 7.5 }, { text, color: '#FFFFFF' });
    drawRect({ x: 30, y: 7.5 });
  };
}
