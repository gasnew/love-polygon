// @flow

import { toRGB } from '../graphics';
import { buildCircularTextMesh, buildTextMesh } from '../meshes';
import type { Component } from './index';

type Props = {
  text: string,
  color: string,
  scale?: number,
  circular?: boolean,
};

export default function TextBox({
  text,
  color,
  scale = 2,
  circular = false,
}: Props): Component {
  return ({ getRenderable, PrimitiveComponent, render }) =>
    render(
      getRenderable(
        PrimitiveComponent({
          type: circular ? 'CircularTextBox' : 'TextBox',
          buildMesh: circular ? buildCircularTextMesh : buildTextMesh,
          meshProps: { scale, text },
          dynamicProps: { color: toRGB(color) },
        })
      )
    );
}
