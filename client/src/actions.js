// @flow

import type { TouchEvent } from 'touches';

import { getTokens } from './getters';
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
  const token = getTokens().find(token =>
    isInCircle({
      position,
      center: token.position,
      radius: token.radius,
    })
  );
  if (!token)
    return;
  console.log('grab but sad cause no action');
}
export function continueDrag(event: TouchEvent, position: Array<number>) {}
export function endDrag(event: TouchEvent, position: Array<number>) {}
