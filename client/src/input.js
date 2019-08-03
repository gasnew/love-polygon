// @flow

import _ from 'lodash';
import type { TouchEvent } from 'touches';

import dispatch, {
  setTokenPosition,
  setTokenNodeId,
  setCurrentTokenId,
} from './state/actions';
import {
  getCurrentTokenId,
  getNode,
  getOwnNodes,
  getToken,
  getOwnTokens,
} from './state/getters';
import { unstagify, unVectorize } from './graphics/graphics';
import announce, { transferToken } from './network/network';
import type { Position } from './state/state';

function dist2(position1, position2) {
  return (
    Math.pow(position2.x - position1.x, 2) +
    Math.pow(position2.y - position1.y, 2)
  );
}

function isInCircle({
  position,
  center,
  radius,
}: {
  position: Position,
  center: Position,
  radius: number,
}) {
  return dist2(position, center) < Math.pow(radius, 2);
}

export function beginDrag(event: TouchEvent, mousePosition: Array<number>) {
  const position = unstagify(unVectorize(mousePosition));
  const id: ?string = _.findKey(getOwnTokens(), token =>
    isInCircle({
      position,
      center: token.position,
      radius: token.radius,
    })
  );
  if (!id) return;

  dispatch(setTokenPosition(id, position.x, position.y));
  dispatch(setCurrentTokenId(id));
}

export function continueDrag(event: TouchEvent, mousePosition: Array<number>) {
  const id = getCurrentTokenId();
  if (!id) return;

  const position = unstagify(unVectorize(mousePosition));
  dispatch(setTokenPosition(id, position.x, position.y));
}

export function endDrag(event: TouchEvent, mousePosition: Array<number>) {
  const tokenId = getCurrentTokenId();
  if (!tokenId) return;

  const position = unstagify(unVectorize(mousePosition));
  const closestNode = _.minBy(_.values(getOwnNodes()), node =>
    dist2(position, node.position)
  );
  const token = getToken(tokenId);
  const newNodeId = isInCircle({
    position,
    center: closestNode.position,
    radius: closestNode.radius,
  }) && closestNode.id;

  const node = getNode(newNodeId || token.nodeId);
  dispatch(setTokenPosition(tokenId, node.position.x, node.position.y));
  if (node.id !== token.nodeId)
    announce(transferToken(tokenId, token.nodeId, node.id));
  dispatch(setTokenNodeId(tokenId, node.id));

  dispatch(setCurrentTokenId(null));
}
