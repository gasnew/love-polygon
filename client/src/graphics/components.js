// @flow

import type { Regl } from 'regl';

import {
  getOwnRelationship,
  getPlayers,
  getVisualObjectFromProps,
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
    const text = `You have a ${relationship.type} on`;

    const textProps = { text, color: '#FFFFFF' };
    drawText({ x: 30, y: 7.5 }, textProps);
    const { width } = getVisualObjectFromProps(textProps);
    drawText({ x: 30 + width / 2, y: 7.5 }, { text: targetPlayer.name, color: targetPlayer.color });
    drawRect({ x: 30, y: 7.5 });
  };
}
