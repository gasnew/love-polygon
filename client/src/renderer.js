// @flow

import startRegl from 'regl';

import { buildPrimitive } from './commands';
import { getTokens } from './getters';
import draw from './graphics';
import { buildCircleMesh } from './meshes';

import type { Tokens } from './types';

function renderWithProps(tokens: Tokens) {
  const regl = startRegl();

  const circle = buildPrimitive(
    regl,
    buildCircleMesh({ radius: 10, points: 10 })
  );
  const drawToken = draw(circle);

  regl.frame(({ time }) => {
    regl.clear({
      color: [0, 0, 0, 1],
      depth: 1,
    });

    tokens.forEach(token => drawToken(token.position));
  });
}

export default function render() {
  renderWithProps(getTokens());
}
