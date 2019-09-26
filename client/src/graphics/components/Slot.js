// @flow

import _ from 'lodash';
import React from 'react';

import { toRGB } from '../graphics';
import { buildCircleMesh } from '../meshes';
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
import type { Component } from './index';
import type { Node } from '../../state/state';

type Props = {
  node: Node,
};

export default function Slot({ node }: Props) {
  const otherPlayerFromNode = (node: Node) => {
    return _.find(
      getPlayers(),
      player =>
        player.id !== getSessionInfo().playerId &&
        _.includes(node.playerIds, player.id)
    );
  };

  return (
    <div
      style={{
        width: '100px',
        height: '100px',
        margin: 'auto',
      }}
      key={node.id}
    >
      I am div
    </div>
  );
}
