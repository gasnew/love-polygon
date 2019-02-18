// @flow

import _ from 'lodash';
import type { Regl } from 'regl';

import { primitiveVertexShader, solidFragmentShader } from './shaders';
import type { ShaderProps } from './shaders';

export type Command = ShaderProps => any;
export type Uniforms = {
  color: Array<number>,
};

type Props = {
  regl: Regl,
  mesh: Array<number>,
  fragmentShader?: string,
  uniforms?: Uniforms,
};

export function buildPrimitive({
  regl,
  mesh,
  fragmentShader = solidFragmentShader,
  uniforms = {},
}: Props): Command {
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
      ...uniforms,
    },

    count: _.flattenDeep(mesh).length / 2,
  });
}
