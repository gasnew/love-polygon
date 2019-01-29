// @flow

import { getStageDimensions } from './getters';

import type { Command } from './commands';
import type { Position } from './types';
import type { ShaderProps } from './shaders';

function vectorize(position: Position): ShaderProps {
  return { location: [position.x, position.y] };
}

export function unVectorize(vector: Array<number>): Position {
  return { x: vector[0], y: vector[1] };
}

export default function draw(command: Command) {
  return (data: Position) =>
    command({
      ...vectorize(data),
      ...getStageDimensions(),
    });
}
