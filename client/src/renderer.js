// @flow

import startRegl from 'regl';

import { buildPrimitive } from './commands';
import draw from './graphics';
import { buildCircleMesh } from './meshes';

import type { Tokens } from './types';

export default function render({ tokens }: { tokens: Tokens }) {
  const regl = startRegl();

  const circle = buildPrimitive(
    regl,
    buildCircleMesh({ radius: 0.1, points: 10 })
  );
  const drawToken = draw(circle);

  regl.frame(({ time }) => {
    regl.clear({
      color: [0, 0, 0, 1],
      depth: 1,
    });

    tokens.forEach(token => drawToken(token));
  });
}
