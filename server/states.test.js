// @flow

import _ from 'lodash';
import uniqid from 'uniqid';

import {
  buildRelationships,
  getNumberOfLovers,
  getRoles,
  getRomanceState,
  getTrueLoveState,
  pairs,
} from './states';
import type { Player, Players } from './networkTypes';

jest.mock('uniqid');

function buildPlayer(id: string): Player {
  return {
    id,
    name: 'bobbeh',
    active: true,
    inRound: true,
    color: '#000000',
  };
}

function buildPlayers(ids: string[]): $Shape<Players> {
  return _.keyBy(_.map(ids, buildPlayer), 'id');
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
  it('returns a number', () => {
    expect(getNumberOfLovers(3)).toEqual(3);
  });

  it('throws an error if number of players is unsupported', () => {
    expect(() => getNumberOfLovers(1000)).toThrow(/Too many folks for love/);
  });
});

describe('getRoles', () => {
  it('returns lovers and wingmen given a set of players', () => {
    const players = buildPlayers(['abc', 'def', 'ghi', 'jkl']);

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
    const sourcePlayers = buildPlayers(['abc', 'def']);
    const targetPlayers = buildPlayers(['ghi']);

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
    const sampleMock = jest.spyOn(_, 'sample');
    const sourcePlayers = buildPlayers(['abc', 'def']);
    const targetPlayers = buildPlayers(['ghi', 'jkl']);

    uniqid.mockReturnValueOnce('myFirstId').mockReturnValueOnce('mySecondId');
    sampleMock.mockReturnValue(targetPlayers.jkl);

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

    sampleMock.mockRestore();
  });
});

describe('getTrueLoveState', () => {
  uniqid.mockImplementation(jest.requireActual('uniqid'));

  it('returns the right number of crushes and wingmen', () => {
    const players = buildPlayers(_.map(_.range(8), String));

    const { relationships } = getTrueLoveState({ players });

    expect(_.size(relationships)).toEqual(8);
    expect(_.size(_.filter(relationships, ['type', 'crush']))).toEqual(5);
    expect(_.size(_.filter(relationships, ['type', 'wingman']))).toEqual(3);
  });

  it('never allows someone to crush on themselves', () => {
    const players = buildPlayers(_.map(_.range(8), String));

    _.each(_.range(100), () => {
      const { relationships } = getTrueLoveState({ players });

      expect(
        !_.some(relationships, ({ fromId, toId }) => fromId === toId)
      ).toEqual(true);
    });
  });

  it('returns only one reciprocal crush', () => {
    const players = buildPlayers(_.map(_.range(8), String));

    _.each(_.range(100), () => {
      const { relationships } = getTrueLoveState({ players });

      expect(
        _.flow(
          relationships => _.filter(relationships, ['type', 'crush']),
          crushes =>
            _.filter(crushes, crush =>
              _.some(
                crushes,
                otherCrush =>
                  crush.fromId === otherCrush.toId &&
                  crush.toId === otherCrush.fromId
              )
            ),
          _.size
        )(relationships)
      ).toEqual(2);
    });
  });
});
