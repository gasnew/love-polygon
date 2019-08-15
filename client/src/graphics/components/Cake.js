// @flow

import { toRGB } from '../graphics';
import { buildRectMesh } from '../meshes';
import type { Component } from './index';

export default function Cake(): Component {
  return ({ getRenderable, PrimitiveComponent, render }) =>
    render(
      getRenderable(
        PrimitiveComponent({
          type: 'Rectangle',
          buildMesh: buildRectMesh,
          meshProps: { width: 8, height: 8 },
          dynamicProps: { color: toRGB('#A6DBC2') },
        })
      )
    );
}
