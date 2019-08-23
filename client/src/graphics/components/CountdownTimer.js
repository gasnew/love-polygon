// @flow

import TextBox from './TextBox';
import type { Component } from './index';

type Props = {
  seconds: number,
};

export default function CountdownTimer({ seconds }: Props): Component {
  return ({ getRenderable, PrimitiveComponent, render }) =>
    render(
      getRenderable(
        TextBox({
          text: `${seconds}`,
          scale: 5,
          color: '#FFFFFF',
        })
      )
    );
}
