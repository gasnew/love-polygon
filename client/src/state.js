// @flow

import type { State } from './types';

export default function generateState(): State {
  return {
    stage: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
    tokens: [
      {
        position: {
          x: -0.3,
          y: -0.2,
        },
        radius: 0.1,
      },
      {
        position: {
          x: 0.4,
          y: 0.6,
        },
        radius: 0.2,
      },
      {
        position: {
          x: 40,
          y: 60,
        },
        radius: 20,
      },
    ],
  };
}
