// @flow

import _ from 'lodash';
import React from 'react';

import CountdownTimer from './CountdownTimer';
import NeedsBanner from './NeedsBanner';
import Paper from '@material-ui/core/Paper';
import RelationshipBanner from './RelationshipBanner';
import SlotList from './SlotList';
import {
  getNeedsLeft,
  getOwnNeed,
  getOwnNodes,
  getOwnRelationship,
  getSessionInfo,
} from '../../state/getters';
import type { Phase } from '../../../../server/networkTypes';

type Props = {
  phase: Phase,
};

export default function Romance({ phase }: Props) {
  const { playerId } = getSessionInfo();
  const nodes = getOwnNodes();
  const relationship = getOwnRelationship();
  const sharedNodes = _.sortBy(_.pickBy(nodes, ['type', 'shared']), 'id');
  const storageNodes = _.pickBy(nodes, ['type', 'storage']);
  const need = getOwnNeed();

  if (!relationship) return <p>nah relationship</p>;

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Paper elevation={9} square style={{ zIndex: 1, padding: 10 }}>
        <RelationshipBanner relationship={relationship} />
      </Paper>
      <Paper
        elevation={0}
        square
        style={{
          zIndex: 0,
          padding: 10,
          backgroundColor: '#F8F8F8',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
      >
        <div style={{ marginTop: 20 }}>
          <SlotList nodes={sharedNodes} arc={true} />
        </div>
        <div style={{ marginBottom: 20, marginTop: 'auto' }}>
          <SlotList nodes={storageNodes} />
        </div>
      </Paper>
      <Paper elevation={15} square style={{ zIndex: 1 }}>
        <NeedsBanner
          need={need}
          needsLeft={getNeedsLeft(playerId)}
          enabled={phase.name === 'romance'}
        />
      </Paper>
      <div
        style={{
          position: 'absolute',
          top: '50%',
          textAlign: 'center',
          width: '100%',
          pointerEvents: 'none',
        }}
      >
        {phase.name === 'countdown' && phase.countdownStartedAt && (
          <CountdownTimer startedAt={phase.countdownStartedAt} />
        )}
      </div>
    </div>
  );
}
