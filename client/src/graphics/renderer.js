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
  buildCircularText,
  buildHeart,
} from './commands';
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

  const drawToken = draw(buildHeart(regl));
  const drawNode = draw(buildCircle(regl));
  const drawName = draw(cached(buildCircularText(regl)));
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
    _.each(tokens, token => drawToken(token.position));
    _.each(nodes, node => drawNode(node.position));
    _.each(sharedNodes, node => {
      const { name, color } = otherPlayerFromNode(node);
      drawName(node.position, { text: name, color });
    });
  });
}
