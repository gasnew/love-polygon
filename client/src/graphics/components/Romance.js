// @flow

import _ from 'lodash';
import React from 'react';

import CountdownTimer from './CountdownTimer';
import FinishRoundButton from './FinishRoundButton';
import RelationshipBanner from './RelationshipBanner';
import SlotList from './SlotList';
import {
  getOwnNeed,
  getOwnNodes,
  getOwnRelationship,
  getOwnTokens,
} from '../../state/getters';
import type { Phase } from '../../../../server/networkTypes';

export function needsMet(): boolean {
  const nodes = getOwnNodes();
  const storedTokens = _.pickBy(
    getOwnTokens(),
    token => nodes[token.nodeId].type === 'storage'
  );
  const need = getOwnNeed() || {};
  return _.filter(storedTokens, ['type', need.type]).length >= need.count;
}

type Props = {
  phase: Phase,
};

export default function Romance({ phase }: Props) {
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
        height: '100%',
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
        {needsMet() && phase.name === 'romance' && (
          <FinishRoundButton needType={need.type} />
        )}
      </div>
      <div
        style={{
          position: 'absolute',
          top: '50%',
          textAlign: 'center',
          width: '100%',
        }}
      >
        {phase.name === 'countdown' && (
          <CountdownTimer
            seconds={Math.ceil(
              15 - (Date.now() - (phase.countdownStartedAt || 0)) / 1000
            )}
          />
        )}
      </div>
    </div>
  );
}
