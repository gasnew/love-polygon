// Phases
export const LOBBY = 'lobby';
export const ROMANCE = 'romance';

// Edges
export const START_GAME = 'startGame';
export const RESTART = 'restart';

export default async function getFollowEdge(
  getPhaseName,
  setPhaseName,
  { startGame }
) {
  const graph = {
    [LOBBY]: {
      [START_GAME]: startGame,
    },
    [ROMANCE]: {
      [RESTART]: startGame,
    },
  };

  return async edge => {
    const phaseName = await getPhaseName();
    const phase = graph[phaseName];
    if (phase && phase[edge]) {
      await setPhaseName(edge);
      graph[edge]();
    } else console.log(`Cannot follow edge ${edge} on phase ${phase}!`);
  };
}
