// @flow

import _ from 'lodash';
import React from 'react';

import CountdownTimer from './CountdownTimer';
import FinishRoundButton from './FinishRoundButton';
import RelationshipBanner from './RelationshipBanner';
import SlotList from './SlotList';
import {
  getNeedsMet,
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
      <RelationshipBanner relationship={relationship} />
      <div
        style={{
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
      </div>
      <div>
        <div>
          {need && (
            <h2 style={{ textAlign: 'center' }}>
              Need {need.count} {need.type}s
            </h2>
          )}
        </div>
        <div style={{ textAlign: 'center' }}>
          {getNeedsMet(playerId) && phase.name === 'romance' && (
            <FinishRoundButton needType={need.type} />
          )}
        </div>
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
    </div>
  );
}
