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
  // do initial data massaging
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

  const nodeData: Nodes = getOwnNodes();
  const sharedNodeData = _.pickBy(nodeData, ['type', 'shared']);
  const tokenData: Tokens = getOwnTokens();

  return ({ getRenderable, render }) => {
    const banner = getRenderable(Banner());
    const tokens = _.map(tokenData, token =>
      getRenderable(tokenTypes[token.type](), token.position)
    );
    const slots = _.map(sharedNodeData, node => {
      return getRenderable(
        Slot({ player: otherPlayerFromNode(node) }),
        node.position
      );
    });

    return render(banner, ...tokens, ...slots);
  };
}
