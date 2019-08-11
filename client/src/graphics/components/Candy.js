// @flow

import { toRGB } from '../graphics';
import { buildCircleMesh } from '../meshes';
import type { Component } from './index';

export default function Candy(): Component {
  return ({ getRenderable, PrimitiveComponent, render }) =>
    render(
      getRenderable(
        PrimitiveComponent({
          type: 'Circle',
          buildMesh: buildCircleMesh,
          meshProps: { scale: 6, steps: 3 },
          dynamicProps: { color: toRGB('#00ff00') },
        })
      )
    );
}
