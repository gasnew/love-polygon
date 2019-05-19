// @flow

import type { Regl } from 'regl';

import {
  getOrBuildVisualObject,
  getOwnRelationship,
  getPlayers,
} from '../state/getters';
import { buildRect, buildText } from './visualObjects';
import draw, { cached } from './graphics';

export type Component<Props> = Props => void;

export function banner(regl: Regl): Component<void> {
  const textBuilder = buildText(regl);
  const drawRect = draw(buildRect(regl));
  const drawText = draw(cached(textBuilder));

  const getTextObject = props => getOrBuildVisualObject(textBuilder, props);

  return () => {
    const relationship = getOwnRelationship();
    if (!relationship) return;
    const targetPlayer = getPlayers()[relationship.toId];

    const relationshipProps = {
      text:
        relationship.type === 'crush'
          ? 'You have a crush on'
          : 'You are a wingman for',
      color: '#FFFFFF',
    };
    const playerProps = { text: targetPlayer.name, color: targetPlayer.color };

    const { width: relationshipWidth } = getTextObject(relationshipProps);
    const { width: playerWidth } = getTextObject(playerProps);
    const totalWidth = relationshipWidth + playerWidth + 1;
    const proportion = relationshipWidth / totalWidth;

    drawText(
      { x: 30 - ((1 - proportion) * totalWidth) / 2, y: 7.5 },
      relationshipProps
    );
    drawText({ x: 30 + (proportion * totalWidth) / 2, y: 7.5 }, playerProps);
    drawRect({ x: 30, y: 7.5 });
  };
}
