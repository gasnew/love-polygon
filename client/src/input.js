// @flow

import _ from 'lodash';
import type { TouchEvent } from 'touches';

import dispatch, { setTokenPosition, setTokenNodeId, setCurrentTokenId } from './actions';
import {
  getCurrentTokenId,
  getNode,
  getOwnNodes,
  getToken,
  getOwnTokens,
} from './getters';
import { unstagify, unVectorize } from './graphics';
import announce, { transferToken } from './network';
import type { Position } from './state';

function isInCircle({
  position,
  center,
  radius,
}: {
  position: Position,
  center: Position,
  radius: number,
}) {
  const dist2 = (position1, position2) =>
    Math.pow(position2.x - position1.x, 2) +
    Math.pow(position2.y - position1.y, 2);
  return dist2(position, center) < Math.pow(radius, 2);
}

export function beginDrag(event: TouchEvent, mousePosition: Array<number>) {
  const position = unstagify(unVectorize(mousePosition));
  const id: string = _.findKey(getOwnTokens(), token =>
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
  const newNodeId: string = _.findKey(getOwnNodes(), node =>
    isInCircle({
      position,
      center: node.position,
      radius: node.radius,
    })
  );
  const token = getToken(tokenId);
  const nodeId = newNodeId || token.nodeId;

  const node = getNode(nodeId);
  dispatch(setTokenPosition(tokenId, node.position.x, node.position.y));
  if (nodeId !== token.nodeId)
    announce(transferToken(tokenId, token.nodeId, nodeId));
  dispatch(setTokenNodeId(tokenId, nodeId));

  dispatch(setCurrentTokenId(null));
}
