// @flow

import _ from 'lodash';
import startRegl from 'regl';

import { buildPrimitive } from './commands';
import { getOwnNodes, getOwnTokens } from './getters';
import draw, { toRGB } from './graphics';
import { buildCircleMesh, buildHeartMesh } from './meshes';

import type { Nodes, Tokens } from './state';

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
  const drawToken = draw(heart);
  const drawNode = draw(circle);

  regl.frame(({ time }) => {
    const nodes: Nodes = getOwnNodes();
    const tokens: Tokens = getOwnTokens();

    regl.clear({
      color: toRGB('#FEFEFF'),
      depth: 1,
    });

    _.each(tokens, token => drawToken(token.position));
    _.each(nodes, node => drawNode(node.position));
  });
}
