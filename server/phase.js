// @flow

import type { PhaseName } from './networkTypes';

// Phases
export const LOBBY = 'lobby';
export const ROMANCE = 'romance';

// Edges
export const START_GAME = 'startGame';
export const RESTART = 'restart';

type Edge = 'startGame' | 'restart' | 'finishGame';
type Action = () => Promise<void>;
type Transition = ((PhaseName) => void) => Promise<void>;

function transition(phase: PhaseName, action: Action): Transition {
  return async setPhaseName => {
    await setPhaseName(phase);
    action();
  };
}

type Graph = {
  [PhaseName]: {
    [Edge]: Transition,
  },
};

type Props = {
  getPhaseName: () => Promise<PhaseName>,
  setPhaseName: PhaseName => void,
  startGame: Action,
};
export default function getFollowEdge({
  getPhaseName,
  setPhaseName,
  startGame,
}: Props) {
  const graph: Graph = {
    lobby: {
      startGame: transition('romance', startGame),
    },
    romance: {
      restart: transition('romance', startGame),
      finishGame: transition('countdown', startCountdown),
    },
  };

  return async (edge: Edge) => {
    const phaseName: PhaseName = await getPhaseName();
    const edges = graph[phaseName];
    if (edges && edges[edge]) {
      await edges[edge](setPhaseName);
    } else console.log(`Cannot follow edge ${edge} on phase ${phaseName}!`);
  };
}
