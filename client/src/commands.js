// @flow

import {
  solidFragmentShader,
  squareVertexShader,
  noiseFragmentShader,
} from './shaders';

import type { Regl } from 'regl';

export type ShaderProps = {
  location: Array<number>,
};
export type Command = ShaderProps => any;

export function buildSquare(regl: Regl): Command {
  return regl({
    frag: noiseFragmentShader,
    vert: squareVertexShader,
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
