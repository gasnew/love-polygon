// @flow

import _ from 'lodash';
import React from 'react';

type Props = {
  color: string,
  radius: number,
  magnitude?: number,
  count?: number,
};

export default function Burst({
  color,
  radius,
  count = 9,
  magnitude = 9,
}: Props) {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="-50 -50 100 100"
      preserveAspectRatio="xMidYMid meet"
    >
      {_.map(
        _.range(Math.PI / count / 2, 2 * Math.PI, (2 * Math.PI) / count),
        rotation => (
          <line
            key={rotation}
            id={`line_${rotation}`}
            x1={radius * Math.cos(rotation)}
            y1={radius * Math.sin(rotation)}
            x2={(radius + magnitude) * Math.cos(rotation)}
            y2={(radius + magnitude) * Math.sin(rotation)}
            style={{ stroke: color, fill: 'none', strokeWidth: '3px' }}
          />
        )
      )}
    </svg>
  );
}
