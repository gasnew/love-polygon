// @flow

import React from 'react';

import DraggedItem from './DraggedItem';
import Lobby from './Lobby';
import ResultsTable from './ResultsTable';
import Romance from './Romance';
import VotingBallot from './VotingBallot';
import { getPhase } from '../../state/getters';
import { useGameState } from '../../state/state';

import { getInRound } from '../../state/getters';
import type { Phase } from '../../../../server/networkTypes';

const Scene = ({ phase }: { phase: Phase }) => {
  const slotLists = {
    lobby: <Lobby />,
    romance: <Romance phase={phase} />,
    countdown: <Romance phase={phase} />,
    finished: <Romance phase={phase} />,
    voting: <VotingBallot />,
    results: <ResultsTable />,
  };
  if (slotLists[phase.name])
    return (
      <div style={{ height: '770px' }}>
        <p>{phase.name}</p>
        {getInRound() ? slotLists[phase.name] : slotLists['lobby']}
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
