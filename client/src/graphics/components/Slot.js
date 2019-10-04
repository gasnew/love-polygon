// @flow

import _ from 'lodash';
import React from 'react';

import Item from './Item';
import { getNodeToken, getPlayers, getSessionInfo } from '../../state/getters';
import type { Node } from '../../state/state';

const SLOT_DIMENSIONS = { width: '200px', height: '200px' };

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
  const token = getNodeToken(node.id);

  return (
    <div>
      <img
        style={{
          ...SLOT_DIMENSIONS,
        }}
        src="https://image.shutterstock.com/image-vector/white-dish-plate-isolated-on-260nw-1054819865.jpg"
      />
      {token && (
        <Item
          token={token}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            marginLeft: 'auto',
            marginRight: 'auto',
            top: 0,
            bottom: 0,
            marginTop: 'auto',
            marginBottom: 'auto',
          }}
        />
      )}
    </div>
  );
}
