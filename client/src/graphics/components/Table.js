// @flow

import _ from 'lodash';

import Banner from './Banner';
import Cake from './Cake';
import Candy from './Candy';
import Cookie from './Cookie';
import CountdownTimer from './CountdownTimer';
import FinishRoundButton from './FinishRoundButton';
import Heart from './Heart';
import NeedInfo from './NeedInfo';
import Slot from './Slot';
import {
  getButton,
  getOwnNeed,
  getOwnNodes,
  getOwnTokens,
  getPhase,
  getPlayers,
  getSessionInfo,
} from '../../state/getters';

import type { Node, Nodes, Tokens } from '../../state/state';
import type { Component } from './index';

export function needsMet(): boolean {
  const nodes = getOwnNodes();
  const storedTokens = _.pickBy(
    getOwnTokens(),
    token => nodes[token.nodeId].type === 'storage'
  );
  const need = getOwnNeed() || {};
  return _.filter(storedTokens, ['type', need.type]).length >= need.count;
}

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
  const button = getButton();
  const need = getOwnNeed() || {};
  const phase = getPhase() || {};

  return ({ getRenderable, render }) =>
    render(
      getRenderable(Banner()),
      ..._.map(nodes, node =>
        getRenderable(
          Slot({ player: otherPlayerFromNode(node), enabled: node.enabled }),
          node.position
        )
      ),
      ..._.map(tokens, token =>
        getRenderable(tokenTypes[token.type](), token.position)
      ),
      (phase.name === 'countdown' || null) &&
        getRenderable(
          CountdownTimer({
            seconds: Math.ceil(
              15 - (Date.now() - (phase.updatedAt || 0)) / 1000
            ),
          }),
          { x: 30, y: 30 }
        ),
      // Ideally, we'd be able to pass in an onClick parameter to getRenderable
      // in order to manage click/touch events for this component. However,
      // that would be a decent amount of work for little payoff in this
      // project. We'll just stick to having one global button state instead.
      // :)
      (_.includes(['romance', 'countdown'], phase.name) || null) &&
        (needsMet() && phase.name === 'romance'
          ? getRenderable(
              FinishRoundButton({ button, need: need.type }),
              button.position
            )
          : getRenderable(NeedInfo({ need: need.type }), button.position))
    );
}
