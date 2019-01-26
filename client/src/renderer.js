// @flow

import startRegl from 'regl';

import type { Position, Tokens } from './types';

function vectorize(object: Position) {
  return { location: [object.x, object.y] };
}

function buildSquare(regl) {
  return regl({
    frag: `
      precision mediump float;
      uniform vec4 color;
      void main () {
        gl_FragColor = color;
      }`,

    vert: `
      precision mediump float;
      attribute vec2 position;
      uniform vec2 location;
      void main () {
        gl_Position = vec4(position.x + location.x, position.y + location.y, 0, 1);
      }`,

    attributes: {
      position: [
        [-0.1, 0.1],
        [-0.1, -0.1],
        [0.1, -0.1],
        [0.1, -0.1],
        [0.1, 0.1],
        [-0.1, 0.1],
      ],
    },

    uniforms: {
      color: [1, 0, 0, 1],
      location: regl.prop('location'),
    },

    count: 6,
  });
}

function draw(command) {
  return (data: Position) => command(vectorize(data));
}

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
