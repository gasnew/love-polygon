// @flow

import _ from 'lodash';
import type { Regl } from 'regl';

import {
  getNeeds,
  getOrBuildVisualObject,
  getOwnRelationship,
  getPlayer,
  getPlayerRelationship,
} from '../state/getters';
import { buildRect, buildText } from './visualObjects';
import draw, { cached } from './graphics';
import type Drawer from './graphics';
import type Position from '../state/state';

export type Component<Props> = Props => void;

export function banner(regl: Regl): Component<{ [string]: Drawer<Position> }> {
  const textBuilder = buildText(regl);
  const drawRect = draw(buildRect(regl));
  const drawText = draw(cached(textBuilder));

  const getTextObject = props => getOrBuildVisualObject(textBuilder, props);

  const needTypeById = id => _.find(getNeeds(), ['playerId', id]).type;
  const getCrushStuff = targetPlayer => ({
    relationshipProps: {
      text: 'You have a crush on',
      color: '#FFFFFF',
    },
    needProps: {
      text: 'needs',
      color: '#FFFFFF',
    },
    needType: needTypeById(targetPlayer.id),
  });
  const getWingmanStuff = targetPlayer => ({
    relationshipProps: {
      text: 'You are a wingman for',
      color: '#FFFFFF',
    },
    needProps: {
      text: "'s crush needs",
      color: '#FFFFFF',
    },
    needType: needTypeById(
      getPlayer(getPlayerRelationship(targetPlayer.id).toId).id
    ),
  });

  return drawToken => {
    const relationship = getOwnRelationship();
    if (!relationship) return;
    const targetPlayer = getPlayer(relationship.toId);

    const playerProps = { text: targetPlayer.name, color: targetPlayer.color };
    const { relationshipProps, needProps, needType } =
      relationship.type === 'crush'
        ? getCrushStuff(targetPlayer)
        : getWingmanStuff(targetPlayer);
    const drawNeedToken = drawToken[needType];

    const { width: relationshipWidth } = getTextObject(relationshipProps);
    const { width: playerWidth } = getTextObject(playerProps);
    const totalWidth = relationshipWidth + playerWidth + 1;
    const proportion = relationshipWidth / totalWidth;
    drawText(
      { x: 30 - ((1 - proportion) * totalWidth) / 2, y: 7.5 },
      relationshipProps
    );
    drawText({ x: 30 + (proportion * totalWidth) / 2, y: 7.5 }, playerProps);

    const { width: needWidth } = getTextObject(needProps);
    const totalWidth2 = needWidth + playerWidth + 1;
    const proportion2 = needWidth / totalWidth;
    drawText({ x: 30 - ((1 - proportion2) * totalWidth2) / 2, y: 11 }, playerProps);
    drawText(
      { x: 30 + (proportion2 * totalWidth2) / 2, y: 11 },
      needProps
    );
    drawNeedToken({ x: 50, y: 11 });

    drawRect({ x: 30, y: 7.5 });
  };
}
