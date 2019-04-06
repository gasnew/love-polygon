// @flow

import _ from 'lodash';
import vectorizeText from 'vectorize-text';

import { stagifyVector } from './graphics';

type CircleProps = {
  scale: number,
  steps: number,
};

type HeartProps = {
  scale: number,
  steps: number,
};

type TextProps = {
  text: string,
};

function getMeshBuilder({ getX, getY }) {
  return steps => {
    const tau = 2 * Math.PI;
    const angleStep = (2 * Math.PI) / steps;
    const edge = angle => [getX(angle), getY(angle)];
    return stagifyVector(
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

export function buildTextMesh({ text }: TextProps): Array<number> {
  const thing = vectorizeText(text, {
    triangles: true,
    textBaseline: 'hanging',
    textAlign: 'center',
    width: 50,
    font: 'Trebuchet MS',
  });
  const mesh = _.reduce(
    thing.cells,
    (mesh, cell) => [
      ...mesh,
      _.reduce(
        _.range(3),
        (triangle, index) => {
          const bob = [
            ...triangle,
            [
              thing.positions[cell[index]][0],
              thing.positions[cell[index]][1],
              //thing.positions[cell[(index + 1) % 3]][0],
            ],
          ]
          return bob;
        },
        []
      ),
    ],
    []
  );
  console.log(thing);
  console.log(mesh);
  return stagifyVector(mesh);
}
