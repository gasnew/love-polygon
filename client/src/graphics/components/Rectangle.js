// @flow

import { toRGB } from '../graphics';
import { buildRectMesh } from '../meshes';
import type { Component } from './index';

type Props = {
  width: number,
  height: number,
  color: string,
};

export default function Rectangle({ width, height, color }: Props): Component {
  return ({ getRenderable, PrimitiveComponent, render }) =>
    render(
      getRenderable(
        PrimitiveComponent({
          type: 'Rectangle',
          buildMesh: buildRectMesh,
          meshProps: { width, height },
          dynamicProps: { color: toRGB(color) },
        }),
      )
    )
}
