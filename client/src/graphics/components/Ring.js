// @flow

import React from 'react';
import { Motion, spring } from 'react-motion';

import Burst from './Burst';
import DottedCircle from './DottedCircle';

const SPRING_CONFIG = { stiffness: 270, damping: 27 };

type Props = {
  color: string,
  hover: boolean,
  holdingItem: boolean,
  isDragging: boolean,
};

export default function Ring({ color, hover, holdingItem, isDragging }: Props) {
  return (
    <div
      style={{
        position: 'absolute',
        height: '100%',
        width: '100%',
      }}
    >
      <Motion
        defaultStyle={{ radius: 35 }}
        style={{
          radius: holdingItem ? spring(35, SPRING_CONFIG) : 22,
        }}
      >
        {({ radius }) =>
          radius > 22 && radius <= 34.9 ? (
            <div style={{ position: 'absolute' }}>
              <Burst color={color} radius={radius} />
            </div>
          ) : (
            <div />
          )
        }
      </Motion>
      <Motion
        defaultStyle={{ strokeWidth: 0 }}
        style={{
          strokeWidth:
            !holdingItem || isDragging ? spring(6, SPRING_CONFIG) : 0,
        }}
      >
        {({ strokeWidth }) => (
          <div
            style={{
              position: 'absolute',
              height: '50%',
              width: '50%',
              top: '25%',
              left: '25%',
            }}
          >
            <DottedCircle color={color} strokeWidth={strokeWidth} />
          </div>
        )}
      </Motion>
      <Motion
        defaultStyle={{ radius: 0 }}
        style={{
          radius: hover
            ? spring(50, SPRING_CONFIG)
            : holdingItem && !isDragging
            ? 0
            : spring(0, SPRING_CONFIG),
        }}
      >
        {({ radius }) => (
          <div
            style={{
              position: 'absolute',
              top: `${50 - radius / 2}%`,
              left: `${50 - radius / 2}%`,
              height: `${radius}%`,
              width: `${radius}%`,
              borderRadius: '50%',
              backgroundColor: color,
            }}
          />
        )}
      </Motion>
    </div>
  );
}
