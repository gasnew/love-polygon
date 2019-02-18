// @flow

import _ from 'lodash';

import { stagifyVector } from './graphics';

type CircleProps = {
  scale: number,
  steps: number,
};

type HeartProps = {
  scale: number,
  steps: number,
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

export function buildHeartMesh({ scale, steps }: CircleProps): Array<number> {
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
