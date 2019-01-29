// @flow

import type { TouchEvent } from 'touches';

import { getTokens } from './getters';
import { unVectorize } from './graphics';
import type { Position } from './types';

function isInCircle({
  position,
  center,
  radius,
}: {
  position: Position,
  center: Position,
  radius: number,
}) {
  return true;
}

export function beginDrag(event: TouchEvent, position: Array<number>) {
  const token = getTokens().find(token =>
    isInCircle({
      position: unVectorize(position),
      center: token.position,
      radius: token.radius,
    })
  );
  console.log(token);
}
export function continueDrag(event: TouchEvent, position: Array<number>) {}
export function endDrag(event: TouchEvent, position: Array<number>) {}
