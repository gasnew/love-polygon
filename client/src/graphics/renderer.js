// @flow

import _ from 'lodash';
import startRegl from 'regl';

import { buildPrimitive } from './commands';
import {
  getNode,
  getOwnNodes,
  getOwnTokens,
  getPlayers,
  getOwnRelationship,
  getSessionInfo,
} from '../state/getters';
import draw, { cached, toRGB } from './graphics';
import {
  buildCircleMesh,
  buildHeartMesh,
  buildRectMesh,
  buildTextMesh,
} from './meshes';

import type { Node, Nodes, Tokens } from '../state/state';

export default function render(element: HTMLDivElement) {
  const regl = startRegl(element);

  const heart = buildPrimitive({
    regl,
    mesh: buildHeartMesh({ scale: 6, steps: 50 }),
    uniforms: {
      color: toRGB('#FF5E5B'),
    },
  });
  const circle = buildPrimitive({
    regl,
    mesh: buildCircleMesh({ scale: 6, steps: 50 }),
    uniforms: {
      color: toRGB('#D6EFFF'),
    },
  });
  const { playerId } = getSessionInfo();
  const otherPlayerFromNode = (node: Node) => {
    return _.find(
      getPlayers(),
      player => player.id !== playerId && _.includes(node.playerIds, player.id)
    );
  };
  const text = ({ text, color }: { text: string, color?: string }) => {
    return buildPrimitive({
      regl,
      mesh: buildTextMesh({
        scale: 2,
        text,
      }),
      uniforms: {
        color: toRGB(color || '#000000'),
      },
    });
  };

  const drawToken = draw(heart);
  const drawNode = draw(circle);
  const drawText = draw(cached(text));

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
      drawText(node.position, { text: name, color });
    });
  });
}
