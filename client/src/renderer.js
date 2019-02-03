// @flow

import _ from 'lodash';
import startRegl from 'regl';

import { buildPrimitive } from './commands';
import { getTokens } from './getters';
import draw from './graphics';
import { buildCircleMesh } from './meshes';

import type { Tokens } from './state';

export default function render() {
  const regl = startRegl();

  const circle = buildPrimitive(
    regl,
    buildCircleMesh({ radius: 6, points: 10 })
  );
  const drawToken = draw(circle);

  regl.frame(({ time }) => {
    const tokens: Tokens = getTokens();

    regl.clear({
      color: [0, 0, 0, 1],
      depth: 1,
    });

    _.each(tokens, token => drawToken(token.position));
  });
}
