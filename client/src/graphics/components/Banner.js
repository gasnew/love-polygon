// @flow

import _ from 'lodash';

import Cake from './Cake';
import Candy from './Candy';
import Cookie from './Cookie';
import Rectangle from './Rectangle';
import TextBox from './TextBox';
import {
  getNeeds,
  getOwnRelationship,
  getPlayer,
  getPlayerRelationship,
} from '../../state/getters';
import type { Component } from './index';

export default function Banner(): Component {
  const relationship = getOwnRelationship();
  if (!relationship) return ({ render }) => render();

  const tokenTypes = {
    cookie: Cookie,
    cake: Cake,
    candy: Candy,
  };
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

  const targetPlayer = getPlayer(relationship.toId);

  const playerProps = { text: targetPlayer.name, color: targetPlayer.color };
  const { relationshipProps, needProps, needType } =
    relationship.type === 'crush'
      ? getCrushStuff(targetPlayer)
      : getWingmanStuff(targetPlayer);

  return ({ getRenderable, PrimitiveComponent, render }) => {
    const { width: relationshipWidth } = getRenderable(
      TextBox(relationshipProps)
    );
    const { width: playerWidth } = getRenderable(TextBox(playerProps));
    const totalWidth = relationshipWidth + playerWidth + 1;
    const proportion = relationshipWidth / totalWidth;

    const { width: needWidth } = getRenderable(TextBox(needProps));
    const totalWidth2 = needWidth + playerWidth + 1;
    const proportion2 = needWidth / totalWidth;

    return render(
      getRenderable(Rectangle({ width: 60, height: 18, color: '#9EC1C1' }), {
        x: 30,
        y: 9,
      }),
      getRenderable(TextBox(relationshipProps), {
        x: 30 - ((1 - proportion) * totalWidth) / 2,
        y: 7.5,
      }),
      getRenderable(TextBox(playerProps), {
        x: 30 + (proportion * totalWidth) / 2,
        y: 7.5,
      }),
      getRenderable(TextBox(playerProps), {
        x: 30 - ((1 - proportion2) * totalWidth2) / 2,
        y: 11,
      }),
      getRenderable(TextBox(needProps), {
        x: 30 + (proportion2 * totalWidth2) / 2,
        y: 11,
      }),
      getRenderable(tokenTypes[needType](), { x: 50, y: 11 })
    );
  };
}
