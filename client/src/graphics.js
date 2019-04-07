// @flow

import _ from 'lodash';

import dispatch, { addCommand } from './actions';
import { getCommands, getStageDimensions } from './getters';
import type { Command } from './commands';
import type { Mesh } from './meshes';
import type { ShaderProps } from './shaders';
import type { Position } from './state';

type Drawer = Position => Command;
type Draw = Command => Drawer;

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

export function stagifyMesh(vector: Mesh): Array<number> {
  const { width } = getStageDimensions();
  return _.map(_.flattenDeep(vector), value => (value * width) / screenScale);
}

type CommandBuilder = string => Command;
type MemoizedDrawer = string => Drawer;
export function memoized(
  draw: Draw,
  commandBuilder: CommandBuilder
): MemoizedDrawer {
  return id => {
    if (!getCommands()[id]) dispatch(addCommand(id, commandBuilder(id)));
    return draw(getCommands()[id]);
  };
}

export default function draw(command: Command): Drawer {
  return (position: Position) =>
    command({
      ...getStageDimensions(),
      ...vectorize(stagifyPosition(position)),
    });
}
