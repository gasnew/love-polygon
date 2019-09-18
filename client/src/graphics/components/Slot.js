// @flow

import { toRGB } from '../graphics';
import { buildCircleMesh } from '../meshes';
import TextBox from './TextBox';
import type { Component } from './index';
import type { Player } from '../../state/state';

type Props = {
  player: Player,
  enabled: boolean,
};

export default function Slot({ player, enabled }: Props): Component {
  return ({ getRenderable, PrimitiveComponent, render }) =>
    render(
      getRenderable(
        PrimitiveComponent({
          type: 'Circle',
          buildMesh: buildCircleMesh,
          meshProps: { scale: 6, steps: 50 },
          dynamicProps: {
            color: enabled ? toRGB('#DCF7F3') : toRGB('#9CC1BE'),
          },
        })
      ),
      player &&
        getRenderable(
          TextBox({ text: player.name, color: player.color, circular: true })
        )
    );
}
