// @flow

import TextBox from './TextBox';
import type { Component } from './index';

type Props = {
  need: string
};

export default function NeedInfo({ need }: Props): Component {
  return ({ getRenderable, render }) =>
    render(
      getRenderable(
        TextBox({
          text: `Need 3 ${need}`,
          color: '#FFFFFF',
          scale: 3,
        })
      )
    );
}
