// @flow

import { buildTextMesh } from '../meshes';
import type { Component } from './index';

type Props = {
  text: string,
  color: string,
};

export default function TextBox({ text, color }: Props): Component {
  return ({ getRenderable, PrimitiveComponent, render }) =>
    render(
      getRenderable(
        PrimitiveComponent({
          type: 'TextBox',
          buildMesh: buildTextMesh,
          meshProps: { scale: 2, text },
          dynamicProps: { color },
        })
      )
    );
}
