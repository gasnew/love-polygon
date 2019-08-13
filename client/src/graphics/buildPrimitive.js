// @flow

import _ from 'lodash';
import type { Regl } from 'regl';

import { stagifyMesh } from './graphics';
import { primitiveVertexShader, solidFragmentShader } from './shaders';
import type { Mesh } from './meshes';

export type Command<Props> = (Props) => void;
export type Primitive<Props> = {|
  command: Command<Props>,
  height: number,
  width: number,
|};

type Props = {
  regl: Regl,
  mesh: Mesh,
  fragmentShader?: string,
};

export default function buildPrimitive({
  regl,
  mesh,
  fragmentShader = solidFragmentShader,
}: Props): Primitive<{}> {
  const stagifiedMesh = stagifyMesh(mesh);
  const meshAsCoordinates = _.flatten(mesh);
  const xs = _.map(meshAsCoordinates, _.first);
  const ys = _.map(meshAsCoordinates, _.last);
  const width = _.max(xs) - _.min(xs);
  const height = _.max(ys) - _.min(ys);

  return {
    command: regl({
      frag: solidFragmentShader,
      vert: primitiveVertexShader,
      attributes: {
        vertexPosition: stagifiedMesh,
      },

      uniforms: {
        color: regl.prop('color') || [1, 0, 0, 1],
        location: regl.prop('location'),
        stageWidth: regl.prop('width'),
        stageHeight: regl.prop('height'),
      },

      count: stagifiedMesh.length / 2,
    }),
    height,
    width,
  };
}
