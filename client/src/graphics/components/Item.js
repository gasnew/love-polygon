// @flow

import Color from 'color';
import _ from 'lodash';
import React, { useState } from 'react';
import { useDrag } from 'react-dnd';

import { useInterval } from './CountdownTimer';
import Heart from './Heart';
import {
  getNode,
  getPlayer,
  getSessionInfo,
  imageColorFilter,
} from '../../state/getters';
import type { Token } from '../../state/state';

export const TOKEN = 'token';
const IMAGES_URLS = {
  heart: 'heart.png',
  cookie: 'cookie.png',
  cake: 'cake.png',
  candy: 'candy.png',
};

function Plate({
  color,
  enabled,
  other,
}: {
  color: string,
  enabled: boolean,
  other: boolean,
}) {
  const [glowIndex, setGlowIndex] = useState(0);
  useInterval(() => setGlowIndex((glowIndex + 1) % 3), 83);

  return (
    <div>
      <img
        alt="I am delicious plate"
        style={{
          height: '100%',
          width: '100%',
          position: 'absolute',
        }}
        src="plate.png"
      />
      <img
        alt="I am delicious rim"
        style={{
          height: '100%',
          width: '100%',
          position: 'absolute',
          filter: imageColorFilter(
            Color({ r: 255, g: 163, b: 152 }),
            Color(color).darken(enabled ? 0.08 : 0.3)
          ),
        }}
        src="rim.png"
      />
      {other && (
        <img
          alt="I am delicious glow"
          style={{
            height: '100%',
            width: '100%',
            position: 'absolute',
            filter: imageColorFilter(
              Color({ r: 255, g: 163, b: 152 }),
              Color(color).darken(enabled ? 0.08 : 0.3)
            ),
          }}
          src={`glow${glowIndex}.png`}
        />
      )}
    </div>
  );
}

type Props = {
  token: Token,
};

export default function Item({ token }: Props) {
  const [{ isDragging }, drag] = useDrag({
    item: { id: token && token.id, type: TOKEN },
    collect: monitor => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  const { playerId } = getSessionInfo();
  const player = getPlayer(playerId);
  const node = getNode(token.nodeId);
  const otherPlayerId =
    node.playerIds.length === 2 &&
    _.find(node.playerIds, id => id !== playerId);
  const color = otherPlayerId ? getPlayer(otherPlayerId).color : player.color;
  const tokenType = token && token.type;

  return (
    !isDragging && (
      <div
        ref={drag}
        style={{
          height: '100%',
          width: '100%',
          ...(node.enabled ? {} : { filter: 'brightness(0.7)' }),
        }}
      >
        <div
          style={{
            height: '140%',
            width: '140%',
            left: '-20%',
            bottom: '-20%',
            position: 'absolute',
          }}
        >
          <Plate color={color} enabled={node.enabled} other={!!otherPlayerId} />
        </div>
        <div
          style={{
            position: 'absolute',
            height: '60%',
            width: '60%',
            left: '15%',
            bottom: '8%',
          }}
        >
          {tokenType === 'heart' ? (
            <Heart token={token} />
          ) : (
            <img
              alt="I am a delicious food"
              style={{ height: '100%', width: '100%' }}
              src={IMAGES_URLS[tokenType]}
            />
          )}
        </div>
      </div>
    )
  );
}
