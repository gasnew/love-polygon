// @flow

import hashObject from 'object-hash';
import _ from 'lodash';

import type Socket from 'socket.io-client';

import dispatch, { addVisualObject } from './actions';
import type { Phase, SessionInfo } from '../../../server/networkTypes';
import type { VisualObjectBuilder } from '../graphics/graphics';
import type { VisualObject } from '../graphics/visualObjects';
import type {
  VisualObjects,
  Dimensions,
  Need,
  Needs,
  Node,
  Nodes,
  Player,
  Players,
  Relationship,
  Relationships,
  State,
  Token,
  Tokens,
} from './state';

export function getState(): State {
  return window.state;
}

export function getPhase(): ?Phase {
  return getState().phase;
}

export function getSessionInfo(): SessionInfo {
  return getState().sessionInfo;
}

export function getStageDimensions(): Dimensions {
  // NOTE: This one is secretly not in state. Shhhh
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

export function getSocket(): ?Socket {
  return getState().socket;
}

export function getCurrentTokenId(): ?string {
  return getState().currentTokenId;
}

export function getPlayers(): Players {
  return getState().players;
}

export function getPlayer(playerId: string): Player {
  return getPlayers()[playerId];
}

export function getNodes(): Nodes {
  return getState().nodes;
}

export function getNode(nodeId: string): Node {
  return getNodes()[nodeId];
}

export function getOwnNodes(): Nodes {
  const { playerId } = getSessionInfo();
  return _.pickBy(getNodes(), node => _.includes(node.playerIds, playerId));
}

export function getTokens(): Tokens {
  return getState().tokens;
}

export function getToken(tokenId: string): Token {
  return getTokens()[tokenId];
}

export function getOwnTokens(): Tokens {
  const nodes = getOwnNodes();
  return _.pickBy(getTokens(), token => nodes[token.nodeId]);
}

export function getRelationships(): Relationships {
  return getState().relationships;
}

export function getPlayerRelationship(playerId: string): Relationship {
  return _.find(getRelationships(), ['fromId', playerId]);
}

export function getOwnRelationship(): Relationship {
  const { playerId } = getSessionInfo();
  return getPlayerRelationship(playerId);
}

export function getNeeds(): Needs {
  return getState().needs;
}

export function getOwnNeed(): Need {
  const { playerId } = getSessionInfo();
  return _.find(getNeeds(), ['playerId', playerId]);
}

export function getVisualObjects(): VisualObjects {
  return getState().visualObjects;
}

export function getVisualObject(visualObjectId: string): VisualObject<{}> {
  return getVisualObjects()[visualObjectId];
}

export function getOrBuildVisualObject<Props>(
  visualObjectBuilder: VisualObjectBuilder<Props>,
  props: Props
): VisualObject<{}> {
  const hash = hashObject(props);
  if (!getVisualObject(hash)) {
    const { command, height, width } = visualObjectBuilder(props);
    dispatch(addVisualObject(hash, command, height, width));
  }
  return getVisualObject(hash);
}
