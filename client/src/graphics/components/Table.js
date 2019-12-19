// @flow

import React from 'react';

import Lobby from './Lobby';
import Romance from './Romance';
import DraggedItem from './DraggedItem';
import {
  getPhase,
} from '../../state/getters';
import { useGameState } from '../../state/state';

import type { Phase } from '../../../../server/networkTypes';

const Scene = ({ phase }: { phase: Phase }) => {
  const slotLists = {
    lobby: <Lobby />,
    romance: <Romance phase={phase}/>,
    countdown: <Romance phase={phase}/>,
    finished: <div>:og-shrug:</div>,
  };
  if (slotLists[phase.name])
    return (
      <div style={{ height: '770px' }}>
        <p>{phase.name}</p>
        {slotLists[phase.name]}
        <DraggedItem />
      </div>
    );
  return <p>No scene defined for {phase.name}</p>;
};

export default function Table() {
  useGameState();

  const phase = getPhase();
  if (!phase) return <div>Loading, my dudes...</div>;

  return <Scene phase={phase} />;
}
