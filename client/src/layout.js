// @flow

import _ from 'lodash';

import type { Position } from './state';

export default function layout(ids: Array<string>): { [string]: Position } {
  const spacing = 60 / (ids.length + 1);
  const spots = _.range(spacing, 60, spacing);
  return _.zipObject(ids, _.map(spots, spot => ({ x: spot, y: 40 })));
}
