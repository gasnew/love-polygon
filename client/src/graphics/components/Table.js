// @flow

import _ from 'lodash';
import React from 'react';

import Banner from './Banner';
import Cake from './Cake';
import Candy from './Candy';
import Cookie from './Cookie';
import CountdownTimer from './CountdownTimer';
import FinishRoundButton from './FinishRoundButton';
import Heart from './Heart';
import NeedInfo from './NeedInfo';
import Slot from './Slot';
import TextBox from './TextBox';
import {
  getButton,
  getOwnNeed,
  getOwnNodes,
  getOwnTokens,
  getPhase,
  getPlayers,
  getSessionInfo,
} from '../../state/getters';
import { useGameState } from '../../state/state';

import type { Node, Nodes, Tokens } from '../../state/state';

export function needsMet(): boolean {
  const nodes = getOwnNodes();
  const storedTokens = _.pickBy(
    getOwnTokens(),
    token => nodes[token.nodeId].type === 'storage'
  );
  const need = getOwnNeed() || {};
  return _.filter(storedTokens, ['type', need.type]).length >= need.count;
}

export default function Table() {
  const gameState = useGameState();
  const tokenTypes = {
    heart: Heart,
    cookie: Cookie,
    cake: Cake,
    candy: Candy,
  };

  const nodes: Nodes = getOwnNodes();
  const tokens: Tokens = getOwnTokens();
  const button = getButton();
  const need = getOwnNeed() || {};
  const phase = getPhase() || {};

  const slots = _.map(nodes, node => <Slot node={node} />);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
      }}
    >
      {slots}
      Hello I am div
    </div>
  );
}
