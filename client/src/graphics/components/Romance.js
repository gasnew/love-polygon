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
  getOwnTokens,
  getPlayerNodes,
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
  const sharedNodes = _.pickBy(nodes, ['type', 'shared']);
  const storageNodes = _.pickBy(nodes, ['type', 'storage']);
  const need = getOwnNeed();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '50%',
      }}
    >
      <div>
        {relationship && <RelationshipBanner relationship={relationship} />}
      </div>
      <div>
        <SlotList nodes={sharedNodes} />
      </div>
      <div>
        <SlotList nodes={storageNodes} />
      </div>
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
  );
}
