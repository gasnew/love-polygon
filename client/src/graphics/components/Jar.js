// @flow

import _ from 'lodash';
import React from 'react';
import { useDrag, useDrop } from 'react-dnd';

import Heart from './Heart';
import { TOKEN } from './Item';
import { makeUseDropOptions } from './Slot';
import {
  getJarDimensions,
  getNode,
  getNodeToken,
  getPlayerOrder,
  getPlayerTokens,
} from '../../state/getters';
import type { Node } from '../../state/state';

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
  const [, drag] = useDrag({
    item: { id: ownToken && ownToken.id, type: TOKEN },
  });

  return (
    <div
      ref={
        ownToken && getNode(ownToken.nodeId).type === 'loveBucket' ? drag : drop
      }
      style={{
        ...getJarDimensions(),
        backgroundImage: 'url(jar.png)',
        backgroundSize: 'contain',
        position: 'relative',
      }}
    >
      {_.map(tokens, token => (
        <Heart
          key={token.id}
          token={token}
          style={{
            position: 'absolute',
            ...TOKEN_POSITIONS[tokens.indexOf(token)],
          }}
        />
      ))}
    </div>
  );
}
