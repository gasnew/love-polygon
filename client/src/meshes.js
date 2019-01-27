// @flow

import _ from 'lodash';

type CircleProps = {
  radius: number,
  points: number,
};

export function buildCircleMesh({ radius, points }: CircleProps) {
  const tau = 2 * Math.PI;
  const angleStep = (2 * Math.PI) / points;
  const edge = angle => [radius * Math.cos(angle), radius * Math.sin(angle)];
  return _.map(_.range(0, tau, angleStep), angle => [
    [0, 0],
    edge(angle + angleStep),
    edge(angle),
  ]);
}
