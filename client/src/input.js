// @flow

import _ from 'lodash';
import type { TouchEvent } from 'touches';

import dispatch, { setTokenPosition, setCurrentTokenId } from './actions';
import { getCurrentTokenId, getTokens } from './getters';
import { unstagify, unVectorize } from './graphics';
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
  const id: string = _.findKey(getTokens(), token =>
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
  dispatch(setCurrentTokenId(null));
}
