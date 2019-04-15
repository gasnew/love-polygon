// @flow

import hashObject from 'object-hash';
import _ from 'lodash';

import dispatch, { addCommand } from '../state/actions';
import { getCommands, getStageDimensions } from '../state/getters';
import type { Command } from './commands';
import type { Mesh } from './meshes';
import type { ShaderProps } from './shaders';
import type { Position } from '../state/state';

type Drawer<Props: {}> = (Position, ?Props) => void;

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

export default function draw<Props: {}>(command: Command<Props>): Drawer<Props> {
  return (position: Position, props: ?Props) => {
    command({
      ...getStageDimensions(),
      ...vectorize(stagifyPosition(position)),
      ...props,
    });
  };
}

export type CommandBuilder<Props> = Props => Command<{}>;
export function cached<Props: {}>(
  commandBuilder: CommandBuilder<Props>
): Command<Props> {
  return (params: { ...ShaderProps, ...Props }) => {
    const builderParams = _.omit(params, ['location', 'height', 'width']);
    const hash = hashObject(builderParams);
    if (!getCommands()[hash])
      dispatch(addCommand(hash, commandBuilder(builderParams)));
    getCommands()[hash](params);
  };
}
