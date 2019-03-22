// @flow

import _ from 'lodash';
import uniqid from 'uniqid';

import {
  buildRelationships,
  getNumberOfLovers,
  getRoles,
  getRomanceState,
  pairs,
} from './states';
import type { Players } from './networkTypes';

jest.mock('uniqid');

function buildPlayer(id: string): Players {
  return {
    [id]: {
      id,
      name: 'bobbeh',
      active: true,
    },
  };
}

describe('pairs', () => {
  it('returns all pairs of a given array', () => {
    const array = [1, 5, 3, 6];
    expect(pairs(array)).toEqual([
      [1, 5],
      [1, 3],
      [1, 6],
      [5, 3],
      [5, 6],
      [3, 6],
    ]);
  });
});

describe('getNumberOfLovers', () => {
  it('returns a number sometimes', () => {
    const randomMock = jest.spyOn(_, 'random');

    getNumberOfLovers(3);
    expect(randomMock).toHaveBeenCalledWith(1, 3);
  });

  it('throws an error if number of players is unsupported', () => {
    expect(() => getNumberOfLovers(1000)).toThrow(/not supported/);
  });
});

describe('getRoles', () => {
  it('returns lovers and wingmen given a set of players', () => {
    const players = {
      ...buildPlayer('abc'),
      ...buildPlayer('def'),
      ...buildPlayer('ghi'),
      ...buildPlayer('jkl'),
    };

    const shuffleMock = jest.spyOn(_, 'shuffle');
    shuffleMock.mockReturnValue(['abc', 'jkl', 'ghi', 'def']);

    expect(getRoles(players, 2)).toEqual({
      lovers: {
        abc: players['abc'],
        jkl: players['jkl'],
      },
      wingmen: {
        ghi: players['ghi'],
        def: players['def'],
      },
    });

    shuffleMock.mockRestore();
  });
});

describe('buildRelationships', () => {
  it('works with multiple sources and one target', () => {
    const sourcePlayers = {
      ...buildPlayer('abc'),
      ...buildPlayer('def'),
    };
    const targetPlayers = buildPlayer('ghi');

    uniqid.mockReturnValueOnce('myFirstId').mockReturnValueOnce('mySecondId');

    expect(buildRelationships(sourcePlayers, targetPlayers, 'wingman')).toEqual(
      {
        myFirstId: {
          id: 'myFirstId',
          type: 'wingman',
          fromId: 'abc',
          toId: 'ghi',
        },
        mySecondId: {
          id: 'mySecondId',
          type: 'wingman',
          fromId: 'def',
          toId: 'ghi',
        },
      }
    );
  });

  it('works with multiple sources and targets', () => {
    const shuffleMock = jest.spyOn(_, 'shuffle');
    const sourcePlayers = {
      ...buildPlayer('abc'),
      ...buildPlayer('def'),
    };
    const targetPlayers = {
      ...buildPlayer('ghi'),
      ...buildPlayer('jkl'),
    };

    uniqid.mockReturnValueOnce('myFirstId').mockReturnValueOnce('mySecondId');
    shuffleMock.mockReturnValue([targetPlayers.jkl, targetPlayers.ghi]);

    expect(buildRelationships(sourcePlayers, targetPlayers, 'wingman')).toEqual(
      {
        myFirstId: {
          id: 'myFirstId',
          type: 'wingman',
          fromId: 'abc',
          toId: 'jkl',
        },
        mySecondId: {
          id: 'mySecondId',
          type: 'wingman',
          fromId: 'def',
          toId: 'jkl',
        },
      }
    );

    shuffleMock.mockRestore();
  });
});
