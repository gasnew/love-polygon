// @flow

import _ from 'lodash';

import type { Nodes, Position } from '../state/state';

type Layout = { [string]: Position };

export default function layout(ids: Array<string>, y: number): Layout {
  const spacing = 60 / (ids.length + 1);
  const spots = _.range(spacing, 60, spacing);
  return _.zipObject(ids, _.map(spots, spot => ({ x: spot, y })));
}

export function layoutNodes(nodes: Nodes): Layout {
  const storageNodeIds = _.map(_.pickBy(nodes, ['type', 'storage']), 'id');
  const sharedNodeIds = _.map(_.pickBy(nodes, ['type', 'shared']), 'id');
  const loveBucketNodeIds = _.map(
    _.pickBy(nodes, ['type', 'loveBucket']),
    'id'
  );
  return {
    ...layout(storageNodeIds, 50),
    ...layout(sharedNodeIds, 30),
    ...layout(loveBucketNodeIds, 20),
  };
}