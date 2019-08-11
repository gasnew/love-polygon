// @flow

import type { RenderContext } from '../renderContext';
import type { Position } from '../../state/state';

export type Renderable = {
  children: Renderable[],
  position: Position,
  render: () => any,
  height: number,
  width: number,
};
export type Component = RenderContext => Renderable;
