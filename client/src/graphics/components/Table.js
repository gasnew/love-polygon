// @flow

import _ from 'lodash';
import React from 'react';

import Lobby from './Lobby';
import Romance from './Romance';
import DraggedItem from './DraggedItem';
import SlotList from './SlotList';
import {
  getOwnNeed,
  getOwnNodes,
  getOwnTokens,
  getPhase,
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

const Scene = ({ phaseName }: { phaseName: string }) => {
  const slotLists = {
    lobby: <Lobby />,
    romance: <Romance />,
  };
  if (slotLists[phaseName])
    return (
      <div style={{ height: '770px' }}>
        <p>{phaseName}</p>
        {slotLists[phaseName]}
        <DraggedItem />
      </div>
    );
  return <p>No scene defined for {phaseName}</p>;
};

export default function Table() {
  useGameState();

  const phase = getPhase();
  if (!phase) return <div>Loading, my dudes...</div>;

  return <Scene phaseName={phase.name} />;
}
