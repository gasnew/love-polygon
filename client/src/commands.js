// @flow

import _ from 'lodash';
import type { Regl } from 'regl';

import { primitiveVertexShader, solidFragmentShader } from './shaders';
import type { ShaderProps } from './shaders';

export type Command = ShaderProps => any;

export function buildPrimitive(regl: Regl, mesh: Array<number>): Command {
  return regl({
    frag: solidFragmentShader,
    vert: primitiveVertexShader,
    attributes: {
      vertexPosition: mesh,
    },

    uniforms: {
      color: [1, 0, 0, 1],
      location: regl.prop('location'),
      stageWidth: regl.prop('width'),
      stageHeight: regl.prop('height'),
    },

    count: _.flattenDeep(mesh).length / 2,
  });
}
