// @flow

import _ from 'lodash';
import type { Regl } from 'regl';

import { primitiveVertexShader, noiseFragmentShader } from './shaders';
import type { ShaderProps } from './shaders';

export type Command = ShaderProps => any;

export function buildPrimitive(regl: Regl, mesh: Array<number>): Command {
  return regl({
    frag: noiseFragmentShader,
    vert: primitiveVertexShader,
    attributes: {
      position: mesh,
    },

    uniforms: {
      color: [1, 0, 0, 1],
      location: regl.prop('location'),
    },

    count: _.flattenDeep(mesh).length / 2,
  });
}
