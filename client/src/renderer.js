// @flow

import _ from 'lodash';
import startRegl from 'regl';

import { buildPrimitive } from './commands';
import { getTokens } from './getters';
import draw from './graphics';
import { buildCircleMesh, buildHeartMesh } from './meshes';

import type { Tokens } from './state';

export default function render(element: HTMLDivElement) {
  const regl = startRegl(element);

  const heart = buildPrimitive(
    regl,
    buildHeartMesh({ scale: 6, steps: 50 })
  );
  const drawToken = draw(heart);

  const tokens: Tokens = getTokens();
  regl.frame(({ time }) => {
    const tokens: Tokens = getTokens();

    regl.clear({
      color: [0, 0, 0, 1],
      depth: 1,
    });

    _.each(tokens, token => drawToken(token.position));
  });
}
