// @flow

import _ from 'lodash';

import { getStageDimensions } from '../state/getters';
import type { Mesh } from './meshes';
import type { ShaderProps } from './shaders';
import type { Position } from '../state/state';

const screenScale = 60;

export function toRGB(hex: string): Array<number> {
  var result: ?Array<string> = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(
    hex
  );
  return result
    ? [
        parseInt(result[1], 16) / 255,
        parseInt(result[2], 16) / 255,
        parseInt(result[3], 16) / 255,
        1,
      ]
    : [1, 0, 0, 1];
}

export function vectorize(position: Position): $Shape<ShaderProps> {
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

export function stagifyMesh(vector: Mesh): Array<number> {
  const { width } = getStageDimensions();
  return _.map(_.flattenDeep(vector), value => (value * width) / screenScale);
}

export function transform(position1: Position, position2: Position): Position {
  return {
    x: position1.x + position2.x,
    y: position1.y + position2.y,
  };
}
