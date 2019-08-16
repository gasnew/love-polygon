// @flow

import TextBox from './TextBox';
import { toRGB } from '../graphics';
import { buildRectMesh } from '../meshes';
import type { Component } from './index';
import type { Button } from '../../state/state';

type Props = {
  button: Button,
  need: string,
};

export default function FinishRoundButton({ button, need }: Props): Component {
  return ({ getRenderable, PrimitiveComponent, render }) =>
    render(
      getRenderable(
        PrimitiveComponent({
          type: 'Rectangle',
          buildMesh: buildRectMesh,
          meshProps: { width: button.width, height: button.height },
          dynamicProps: {
            color: button.state === 'up' ? toRGB('#9EC5D6') : toRGB('#7CA3B4'),
          },
        })
      ),
      getRenderable(
        TextBox({ text: `Lock in ${need}s and`, color: '#FFFFFF' }),
        { x: 0, y: -2 }
      ),
      getRenderable(
        TextBox({ text: 'END ROUND', scale: 3, color: '#FFFFFF' }),
        { x: 0, y: 1.5 }
      )
    );
}
