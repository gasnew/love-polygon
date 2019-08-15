// @flow

import { toRGB } from '../graphics';
import { buildHeartMesh } from '../meshes';
import type { Component } from './index';

export default function Heart(): Component {
  return ({ getRenderable, PrimitiveComponent, render }) =>
    render(
      getRenderable(
        PrimitiveComponent({
          type: 'Heart',
          buildMesh: buildHeartMesh,
          meshProps: { scale: 6, steps: 50 },
          dynamicProps: { color: toRGB('#FF5E5B') },
        })
      )
    );
}
