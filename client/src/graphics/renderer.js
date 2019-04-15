// @flow

import _ from 'lodash';
import startRegl from 'regl';

import {
  buildCircle,
  buildCircularText,
  buildHeart,
  buildText,
} from './commands';
import {
  getOwnNodes,
  getOwnTokens,
  getPlayers,
  getOwnRelationship,
  getSessionInfo,
} from '../state/getters';
import draw, { cached, toRGB } from './graphics';

import type { Node, Nodes, Tokens } from '../state/state';

export default function render(element: HTMLDivElement) {
  const regl = startRegl(element);

  const otherPlayerFromNode = (node: Node) => {
    return _.find(
      getPlayers(),
      player =>
        player.id !== getSessionInfo().playerId &&
        _.includes(node.playerIds, player.id)
    );
  };

  const heart = buildHeart(regl);
  const circle = buildCircle(regl);
  const text = cached(buildText(regl));
  const circularText = cached(buildCircularText(regl));

  const drawToken = draw(heart);
  const drawNode = draw(circle);
  const drawText = draw(text);
  const drawName = draw(circularText);

  regl.frame(({ time }) => {
    const nodes: Nodes = getOwnNodes();
    const sharedNodes = _.pickBy(nodes, ['type', 'shared']);
    const tokens: Tokens = getOwnTokens();
    const relationship = getOwnRelationship();

    regl.clear({
      color: toRGB('#FEFEFF'),
      depth: 1,
    });

    const { playerId } = getSessionInfo();
    const name = (getPlayers()[playerId] || { name: 'default' }).name;
    drawText({ x: 30, y: 30 }, { text: name });
    _.each(tokens, token => drawToken(token.position));
    _.each(nodes, node => drawNode(node.position));
    _.each(sharedNodes, node => {
      const { name, color } = otherPlayerFromNode(node);
      drawName(node.position, { text: name, color });
    });
  });
}
