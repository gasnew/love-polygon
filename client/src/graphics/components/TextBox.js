// @flow

import { toRGB } from '../graphics';
import { buildCircularTextMesh, buildTextMesh } from '../meshes';
import type { Component } from './index';

type Props = {
  text: string,
  color: string,
  circular?: boolean,
};

export default function TextBox({
  text,
  color,
  circular = false,
}: Props): Component {
  return ({ getRenderable, PrimitiveComponent, render }) =>
    render(
      getRenderable(
        PrimitiveComponent({
          type: circular ? 'CircularTextBox' : 'TextBox',
          buildMesh: circular ? buildCircularTextMesh : buildTextMesh,
          meshProps: { scale: 2, text },
          dynamicProps: { color: toRGB(color) },
        })
      )
    );
}
