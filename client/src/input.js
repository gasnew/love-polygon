// @flow

import _ from 'lodash';
import type { TouchEvent } from 'touches';

import dispatch, {
  pressButton,
  releaseButton,
  setTokenPosition,
  setTokenNodeId,
  setCurrentTokenId,
} from './state/actions';
import {
  getButton,
  getCurrentTokenId,
  getNode,
  getOwnNodes,
  getOwnTokens,
  getToken,
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

function getClosest<T>(objects: { [string]: T }, position: Position): T {
  return _.minBy(_.values(objects), node => dist2(position, node.position));
}

function isInRect({ height, width, x, y }, position) {
  const hHeight = height / 2;
  const hWidth = width / 2;
  return (
    position.x > x - hWidth &&
    position.x < x + hWidth &&
    position.y > y - hHeight &&
    position.y < y + hHeight
  );
}

export function startTouch(event: TouchEvent, mousePosition: Array<number>) {
  const position = unstagify(unVectorize(mousePosition));
  beginDrag(position);
  checkButtonPress(position);
}

function beginDrag(position: Position) {
  const token = getClosest(getOwnTokens(), position);
  const id =
    isInCircle({
      position,
      center: token.position,
      radius: token.radius,
    }) && token.id;
  if (!id) return;

  dispatch(setTokenPosition(id, position.x, position.y));
  dispatch(setCurrentTokenId(id));
}

function checkButtonPress(position: Position) {
  const button = getButton();
  if (
    isInRect(
      { height: button.height, width: button.width, ...button.position },
      position
    )
  )
    dispatch(pressButton());
}

export function continueDrag(event: TouchEvent, mousePosition: Array<number>) {
  const id = getCurrentTokenId();
  if (!id) return;

  const position = unstagify(unVectorize(mousePosition));
  dispatch(setTokenPosition(id, position.x, position.y));
}

export function endTouch(event: TouchEvent, mousePosition: Array<number>) {
  const position = unstagify(unVectorize(mousePosition));
  endDrag(position);
  checkButtonRelease(position);
}

function endDrag(position: Position) {
  const tokenId = getCurrentTokenId();
  if (!tokenId) return;

  const closestNode = getClosest(getOwnNodes(), position);
  const token = getToken(tokenId);
  const newNodeId =
    isInCircle({
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

function checkButtonRelease(position: Position) {
  dispatch(releaseButton());
  const button = getButton();
  if (
    isInRect(
      { height: button.height, width: button.width, ...button.position },
      position
    ) && button.state === 'down'
  )
    console.log('PRESS MAN');
}
