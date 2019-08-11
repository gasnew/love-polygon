// @flow

import Table from './components/Table';
import renderContext from './renderContext';
import { toRGB } from './graphics';

import startRegl from 'regl';

export default function render(element: HTMLDivElement) {
  const regl = startRegl(element);

  regl.frame(({ time }) => {
    regl.clear({
      color: toRGB('#FEFEFF'),
      depth: 1,
    });

    const buildScene = Table();
    const context = renderContext(regl, { x: 0, y: 0 });
    const scene = context.getRenderable(buildScene);
    scene.render();
  });
}
