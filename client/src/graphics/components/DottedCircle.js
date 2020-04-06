// @flow

import React from 'react';

type Props = {
  color: string,
  strokeWidth: number,
};

export default function DottedCircle({color, strokeWidth}: Props) {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid meet"
    >
      <circle
        id="circle"
        cx="50%"
        cy="50%"
        style={{
          stroke: color,
          strokeWidth,
          strokeDasharray: '18px, 14.5px',
          fillOpacity: 0,
        }}
        r="47px"
      />
    </svg>
  );
}
