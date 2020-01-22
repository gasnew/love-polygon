// @flow

import type { PhaseName } from './networkTypes';

// Phases
export const LOBBY = 'lobby';
export const ROMANCE = 'romance';

// Edges
export const START_GAME = 'startGame';
export const RESTART = 'restart';

type Edge = string;
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
  buildGraph: ((PhaseName, Action) => Transition) => Graph,
};

export default function getFollowEdge({
  getPhaseName,
  setPhaseName,
  buildGraph,
}: Props) {
  return async (edge: Edge) => {
    const phaseName: PhaseName = await getPhaseName();
    const edges = buildGraph(transition)[phaseName];
    if (edges && edges[edge]) {
      await edges[edge](setPhaseName);
    } else console.log(`Cannot follow edge ${edge} on phase ${phaseName}!`);
  };
}
