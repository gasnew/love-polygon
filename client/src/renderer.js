// @flow

import startRegl from 'regl';

import draw from './graphics';
import { buildSquare } from './commands';

import type { Tokens } from './types';

export default function render({ tokens }: { tokens: Tokens }) {
  const regl = startRegl();

  const square = buildSquare(regl);
  const drawToken = draw(square);

  regl.frame(({ time }) => {
    regl.clear({
      color: [0, 0, 0, 1],
      depth: 1,
    });

    tokens.forEach(token => drawToken(token));
  });
}
