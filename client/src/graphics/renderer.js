// @flow

import _ from 'lodash';
import startRegl from 'regl';

import {
  getOwnNodes,
  getOwnTokens,
  getPlayers,
  getSessionInfo,
} from '../state/getters';
import {
  buildCircle,
  buildHeart,
  buildRect,
  buildText,
  buildTriangle,
} from './visualObjects';
import { banner } from './components';
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

  const drawToken = {
    heart: draw(buildHeart(regl)),
    cookie: draw(buildTriangle(regl)),
    cake: draw(buildRect(regl, { width: 6, height: 6, color: '#0000ff' })),
    candy: draw(buildCircle(regl, { scale: 5, color: '#00ffff' })),
  }

  const drawNode = draw(buildCircle(regl));
  const drawName = draw(cached(buildText(regl)));
  const drawBanner = banner(regl);

  regl.frame(({ time }) => {
    const nodes: Nodes = getOwnNodes();
    const sharedNodes = _.pickBy(nodes, ['type', 'shared']);
    const tokens: Tokens = getOwnTokens();

    regl.clear({
      color: toRGB('#FEFEFF'),
      depth: 1,
    });

    drawBanner();
    _.each(tokens, token => drawToken[token.type](token.position));
    _.each(sharedNodes, node => {
      const { name, color } = otherPlayerFromNode(node);
      drawName(node.position, { text: name, color, circular: true });
    });
    _.each(nodes, node => drawNode(node.position));
  });
}
