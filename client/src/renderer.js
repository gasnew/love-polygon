// @flow

import _ from 'lodash';
import startRegl from 'regl';

import { buildPrimitive } from './commands';
import {
  getNode,
  getOwnNodes,
  getOwnTokens,
  getPlayers,
  getSessionInfo,
} from './getters';
import draw, { memoized, toRGB } from './graphics';
import { buildCircleMesh, buildHeartMesh, buildTextMesh } from './meshes';

import type { Node, Nodes, Tokens } from './state';

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
  const nameFromNode = (node: Node) => {
    return _.find(
      getPlayers(),
      player => player.id !== playerId && _.includes(node.playerIds, player.id)
    ).name;
  }
  const nameCommandFromNodeId = (id: string) =>
    buildPrimitive({
      regl,
      mesh: buildTextMesh({
        scale: 2,
        text: nameFromNode(getNode(id)),
      }),
      uniforms: {
        color: toRGB('#FF5E5B'),
      },
    });

  const drawToken = draw(heart);
  const drawNode = draw(circle);
  const drawName = memoized(draw, nameCommandFromNodeId);

  regl.frame(({ time }) => {
    const nodes: Nodes = getOwnNodes();
    const sharedNodes = _.pickBy(nodes, ['type', 'shared']);
    const tokens: Tokens = getOwnTokens();

    regl.clear({
      color: toRGB('#FEFEFF'),
      depth: 1,
    });

    _.each(tokens, token => drawToken(token.position));
    _.each(nodes, node => drawNode(node.position));
    _.each(sharedNodes, node => drawName(node.id)(node.position));
  });
}
