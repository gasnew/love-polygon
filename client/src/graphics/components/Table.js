// @flow

import _ from 'lodash';
import React from 'react';

import DraggedItem from './DraggedItem';
import SlotList from './SlotList';
import {
  getOwnNeed,
  getOwnNodes,
  getOwnTokens,
} from '../../state/getters';
import { useGameState } from '../../state/state';

import type { Nodes } from '../../state/state';

export function needsMet(): boolean {
  const nodes = getOwnNodes();
  const storedTokens = _.pickBy(
    getOwnTokens(),
    token => nodes[token.nodeId].type === 'storage'
  );
  const need = getOwnNeed() || {};
  return _.filter(storedTokens, ['type', need.type]).length >= need.count;
}

export default function Table() {
  const gameState = useGameState();

  const nodes: Nodes = getOwnNodes();

  return (
    <div>
      <SlotList nodes={nodes} />
      <DraggedItem />
    </div>
  );
}
