// @flow

import _ from 'lodash';

import { getStageDimensions } from './getters';
import type { Command } from './commands';
import type { ShaderProps } from './shaders';
import type { Position } from './state';

const screenScale = 60;

function vectorize(position: Position): ShaderProps {
  return { location: [position.x, position.y] };
}

export function unVectorize(vector: Array<number>): Position {
  return { x: vector[0], y: vector[1] };
}

export function unstagify(position: Position): Position {
  const { width } = getStageDimensions();
  return {
    x: (position.x / width) * screenScale,
    y: (position.y / width) * screenScale,
  };
}

export function stagifyPosition(position: Position): Position {
  const { width } = getStageDimensions();
  return {
    x: (position.x * width) / screenScale,
    y: (position.y * width) / screenScale,
  };
}

export function stagifyVector(vector: Array<number>): Array<number> {
  const { width } = getStageDimensions();
  return _.map(_.flattenDeep(vector), value => (value * width) / screenScale);
}

export default function draw(command: Command) {
  return (position: Position) =>
    command({
      ...vectorize(stagifyPosition(position)),
      ...getStageDimensions(),
    });
}
