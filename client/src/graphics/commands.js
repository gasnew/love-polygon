// @flow

import _ from 'lodash';
import type { Regl } from 'regl';

import { toRGB } from './graphics';
import {
  buildCircleMesh,
  buildCircularTextMesh,
  buildHeartMesh,
  buildRectMesh,
  buildTextMesh,
} from './meshes';
import { primitiveVertexShader, solidFragmentShader } from './shaders';
import type { CommandBuilder } from './graphics';
import type { ShaderProps } from './shaders';

export type Command<Props: {}> = ({ ...ShaderProps, ...Props }) => void;
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
}: Props): Command<{}> {
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

    count: mesh.length / 2,
  });
}

export function buildHeart(regl: Regl): Command<{}> {
  return buildPrimitive({
    regl,
    mesh: buildHeartMesh({ scale: 6, steps: 50 }),
    uniforms: {
      color: toRGB('#FF5E5B'),
    },
  });
}

export function buildCircle(regl: Regl): Command<{}> {
  return buildPrimitive({
    regl,
    mesh: buildCircleMesh({ scale: 6, steps: 50 }),
    uniforms: {
      color: toRGB('#D6EFFF'),
    },
  });
}

export function buildRect(regl: Regl): Command<{}> {
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
  buildMesh: string => number[]
): CommandBuilder<TextProps> {
  return ({ text, color }: TextProps) =>
    buildPrimitive({
      regl,
      mesh: buildMesh(text),
      uniforms: {
        color: toRGB(color || '#000000'),
      },
    });
}
export function buildText(regl: Regl): CommandBuilder<TextProps> {
  return buildTextBase(regl, text =>
    buildTextMesh({
      scale: 2,
      text,
    })
  );
}
export function buildCircularText(regl: Regl): CommandBuilder<TextProps> {
  return buildTextBase(regl, text =>
    buildCircularTextMesh({
      scale: 2,
      text,
    })
  );
}
