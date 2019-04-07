// @flow

import _ from 'lodash';
import vectorizeText from 'vectorize-text';

import { stagifyMesh } from './graphics';

export type Mesh = number[][][];

type CircleProps = {
  scale: number,
  steps: number,
};

type HeartProps = {
  scale: number,
  steps: number,
};

type TextProps = {
  scale: number,
  text: string,
};

function getMeshBuilder({ getX, getY }) {
  return steps => {
    const tau = 2 * Math.PI;
    const angleStep = (2 * Math.PI) / steps;
    const edge = angle => [getX(angle), getY(angle)];
    return stagifyMesh(
      _.map(_.range(0, tau, angleStep), angle => [
        [0, 0],
        edge(angle + angleStep),
        edge(angle),
      ])
    );
  };
}

export function buildCircleMesh({ scale, steps }: CircleProps): Array<number> {
  return getMeshBuilder({
    getX: angle => scale * Math.cos(angle),
    getY: angle => scale * Math.sin(angle),
  })(steps);
}

export function buildHeartMesh({ scale, steps }: HeartProps): Array<number> {
  return getMeshBuilder({
    getX: angle => scale * Math.sin(angle) ** 3,
    getY: angle =>
      scale *
      (-0.8125 * Math.cos(angle) +
        0.3125 * Math.cos(2 * angle) +
        0.125 * Math.cos(3 * angle) +
        0.0625 * Math.cos(4 * angle)),
  })(steps);
}

export function circlify(mesh: Mesh, radius: number): Mesh {
  return _.map(mesh, triangle =>
    _.map(triangle, ([x, y]) => {
      const magnitude = -radius + y;
      const angle = x / radius + Math.PI;
      return [magnitude * Math.sin(angle), -magnitude * Math.cos(angle)];
    })
  );
}

export function buildTextMesh({ scale, text }: TextProps): Array<number> {
  const vectorized = vectorizeText(text, {
    triangles: true,
    textBaseline: 'middle',
    textAlign: 'center',
    height: scale,
    font: 'Trebuchet MS',
  });
  const mesh = _.reduce(
    vectorized.cells,
    (mesh, cell) => [
      ...mesh,
      _.reduce(
        _.range(3),
        (triangle, index) => [
          ...triangle,
          [
            vectorized.positions[cell[index]][0],
            vectorized.positions[cell[index]][1],
          ],
        ],
        []
      ),
    ],
    []
  );
  return stagifyMesh(circlify(mesh, scale + 5));
}
