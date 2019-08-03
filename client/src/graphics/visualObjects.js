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

type CircleProps = {
  scale: number,
  color: string,
};
export function buildCircle(
  regl: Regl,
  props: CircleProps = { scale: 6, color: '#D6EFFF' }
): VisualObject<{}> {
  const { scale, color } = props;
  return buildPrimitive({
    regl,
    mesh: buildCircleMesh({ scale, steps: 50 }),
    uniforms: {
      color: toRGB(color),
    },
  });
}

type RectProps = {
  width: number,
  height: number,
  color: string,
};
export function buildRect(
  regl: Regl,
  props: RectProps = { width: 60, height: 15, color: '#555555' }
): VisualObject<{}> {
  const { width, height, color } = props;
  return buildPrimitive({
    regl,
    mesh: buildRectMesh({ width, height }),
    uniforms: {
      color: toRGB(color),
    },
  });
}

export function buildTriangle(regl: Regl): VisualObject<{}> {
  return buildPrimitive({
    regl,
    mesh: buildCircleMesh({ scale: 6, steps: 3 }),
    uniforms: {
      color: toRGB('#00ff00'),
    },
  });
}

type TextProps = {
  text: string,
  color?: string,
  circular?: boolean,
};
export function buildText(regl: Regl): VisualObjectBuilder<TextProps> {
  return ({ text, color, circular }: TextProps) =>
    buildPrimitive({
      regl,
      mesh: circular
        ? buildCircularTextMesh({
            scale: 2,
            text,
          })
        : buildTextMesh({
            scale: 2,
            text,
          }),
      uniforms: {
        color: toRGB(color || '#000000'),
      },
    });
}
