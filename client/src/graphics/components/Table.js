// @flow

import _ from 'lodash';

import Banner from './Banner';
import Cake from './Cake';
import Candy from './Candy';
import Cookie from './Cookie';
import Heart from './Heart';
import Slot from './Slot';
import {
  getOwnNodes,
  getOwnTokens,
  getPlayers,
  getSessionInfo,
} from '../../state/getters';

import type { Node, Nodes, Tokens } from '../../state/state';
import type { Component } from './index';

export default function Table(): Component {
  const otherPlayerFromNode = (node: Node) => {
    return _.find(
      getPlayers(),
      player =>
        player.id !== getSessionInfo().playerId &&
        _.includes(node.playerIds, player.id)
    );
  };
  const tokenTypes = {
    heart: Heart,
    cookie: Cookie,
    cake: Cake,
    candy: Candy,
  };

  const nodes: Nodes = getOwnNodes();
  const tokens: Tokens = getOwnTokens();

  return ({ getRenderable, render }) =>
    render(
      getRenderable(Banner()),
      ..._.map(nodes, node =>
        getRenderable(
          Slot({ player: otherPlayerFromNode(node) }),
          node.position
        )
      ),
      ..._.map(tokens, token =>
        getRenderable(tokenTypes[token.type](), token.position)
      ),
    );
}
