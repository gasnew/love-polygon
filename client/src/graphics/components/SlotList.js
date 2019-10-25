// @flow

import _ from 'lodash';
import React from 'react';

import Slot from './Slot';
import {
  getNodeToken,
  getPlayers,
  getSessionInfo,
  getToken,
} from '../../state/getters';
import type { Node, Nodes, Player } from '../../state/state';

type Props = {
  nodes: Nodes,
};

export default function SlotList({ nodes }: Props) {
  const otherPlayerNameFromNode = (node: Node) => {
    return (
      _.find(
        getPlayers(),
        player =>
          player.id !== getSessionInfo().playerId &&
          _.includes(node.playerIds, player.id)
      ) || { name: '' }
    ).name;
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
      }}
    >
      {_.map(nodes, node => (
        <div
          key={node.id}
          style={{
            margin: 'auto',
            position: 'relative',
          }}
        >
          <span>{otherPlayerNameFromNode(node)}</span>
          <Slot node={node} />
        </div>
      ))}
    </div>
  );
}
