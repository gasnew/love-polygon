// @flow

import _ from 'lodash';
import type { Regl } from 'regl';

import { stagifyMesh, toRGB } from './graphics';
import {
  buildCircleMesh,
  buildCircularTextMesh,
  buildHeartMesh,
  buildRectMesh,
  buildTextMesh,
} from './meshes';
import { primitiveVertexShader, solidFragmentShader } from './shaders';
import type { VisualObjectBuilder } from './graphics';
import type { Mesh } from './meshes';
import type { ShaderProps } from './shaders';

export type Command<Props: {}> = ({ ...ShaderProps, ...Props }) => void;
export type VisualObject<Props> = {|
  command: Command<Props>,
  height: number,
  width: number,
|};

export type Uniforms = {
  color: Array<number>,
};

type Props = {
  regl: Regl,
  mesh: Mesh,
  fragmentShader?: string,
  uniforms?: Uniforms,
};

export function buildPrimitive({
  regl,
  mesh,
  fragmentShader = solidFragmentShader,
  uniforms = {},
}: Props): VisualObject<{}> {
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
        color: [1, 0, 0, 1],
        location: regl.prop('location'),
        stageWidth: regl.prop('width'),
        stageHeight: regl.prop('height'),
        ...uniforms,
      },

      count: stagifiedMesh.length / 2,
    }),
    height,
    width,
  };
}

export function buildHeart(regl: Regl): VisualObject<{}> {
  return buildPrimitive({
    regl,
    mesh: buildHeartMesh({ scale: 6, steps: 50 }),
    uniforms: {
      color: toRGB('#FF5E5B'),
    },
  });
}

export function buildCircle(regl: Regl): VisualObject<{}> {
  return buildPrimitive({
    regl,
    mesh: buildCircleMesh({ scale: 6, steps: 50 }),
    uniforms: {
      color: toRGB('#D6EFFF'),
    },
  });
}

export function buildRect(regl: Regl): VisualObject<{}> {
  return buildPrimitive({
    regl,
    mesh: buildRectMesh({ width: 60, height: 15 }),
    uniforms: {
      color: toRGB('#555555'),
    },
  });
}

type TextProps = {
  text: string,
  color?: string,
};
function buildTextBase(
  regl: Regl,
  buildMesh: string => Mesh
): VisualObjectBuilder<TextProps> {
  return ({ text, color }: TextProps) =>
    buildPrimitive({
      regl,
      mesh: buildMesh(text),
      uniforms: {
        color: toRGB(color || '#000000'),
      },
    });
}
export function buildText(regl: Regl): VisualObjectBuilder<TextProps> {
  return buildTextBase(regl, text =>
    buildTextMesh({
      scale: 2,
      text,
    })
  );
}
export function buildCircularText(regl: Regl): VisualObjectBuilder<TextProps> {
  return buildTextBase(regl, text =>
    buildCircularTextMesh({
      scale: 2,
      text,
    })
  );
}
