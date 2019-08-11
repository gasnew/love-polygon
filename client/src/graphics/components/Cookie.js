// @flow

import { toRGB } from '../graphics';
import { buildCircleMesh } from '../meshes';
import type { Component } from './index';

export default function Cookie(): Component {
  return ({ getRenderable, PrimitiveComponent, render }) =>
    render(
      getRenderable(
        PrimitiveComponent({
          type: 'Circle',
          buildMesh: buildCircleMesh,
          meshProps: { scale: 6, steps: 50 },
          dynamicProps: { color: toRGB('#D6EFFF') },
        })
      )
    );
}
