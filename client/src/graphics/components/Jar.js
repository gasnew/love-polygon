// @flow

import _ from 'lodash';
import React from 'react';
import { useDrag, useDrop } from 'react-dnd';
import type { Item as DndItem, Monitor } from 'react-dnd';

import Heart from './Heart';
import Item, { TOKEN, TOKEN_DIMENSIONS } from './Item';
import { makeUseDropOptions } from './Slot';
import announce, {
  swapTokens,
  transferToken as networkedTransferToken,
} from '../../network/network';
import dispatch, { setTokenNodeId, transferToken } from '../../state/actions';
import {
  getNode,
  getNodeToken,
  getPlayerOrder,
  getPlayerTokens,
  getToken,
} from '../../state/getters';
import type { Node, Token } from '../../state/state';

const TOKEN_POSITIONS = [
  {
    transform: 'rotate(-35deg)',
    left: '33%',
    bottom: '5%',
  },
  {
    transform: 'rotate(20deg)',
    left: '50%',
    bottom: '10%',
  },
  {
    transform: 'rotate(-80deg)',
    left: '40%',
    bottom: '15%',
  },
  {
    transform: 'rotate(-190deg)',
    left: '49%',
    bottom: '25%',
  },
  {
    transform: 'rotate(50deg)',
    left: '28%',
    bottom: '26%',
  },
  {
    transform: 'rotate(8deg)',
    left: '40%',
    bottom: '38%',
  },
];

type Props = {
  node: Node,
};

export default function Jar({ node }: Props) {
  const ownToken = getNodeToken(node.id);
  const tokens = _.map(
    getPlayerOrder(),
    playerId => _.values(getPlayerTokens(playerId))[0]
  );

  const [, drop] = useDrop(makeUseDropOptions(node, ownToken));
  const [{ isDragging }, drag] = useDrag({
    item: { id: ownToken && ownToken.id, type: TOKEN },
    collect: monitor => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={
        ownToken && getNode(ownToken.nodeId).type === 'loveBucket' ? drag : drop
      }
      style={{
        height: TOKEN_DIMENSIONS.height * 4,
        width: TOKEN_DIMENSIONS.width * 4,
        backgroundImage: 'url(jar.png)',
        backgroundSize: 'contain',
        position: 'relative',
      }}
    >
      {_.map(
        tokens,
        token =>
          !(ownToken && token.id === ownToken.id && isDragging) && (
            <Heart
              key={token.id}
              token={token}
              style={{
                position: 'absolute',
                ...TOKEN_POSITIONS[tokens.indexOf(token)],
              }}
            />
          )
      )}
    </div>
  );
}
