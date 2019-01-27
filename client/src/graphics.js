// @flow

import type { Command } from './commands';
import type { Position } from './types';
import type { ShaderProps } from './shaders';

function vectorize(object: Position): ShaderProps {
  return { location: [object.x, object.y] };
}

export default function draw(command: Command) {
  return (data: Position) => command(vectorize(data));
}
