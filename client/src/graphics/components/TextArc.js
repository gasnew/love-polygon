// @flow

import _ from 'lodash';
import React from 'react';

type Props = {
  text: string,
  radius: string,
  degrees: number,
};

export default function TextArc({ text, radius, degrees }: Props) {
  console.log(text.length);
  const getDegrees = index => {
    const thing = degrees * (0.5 - index / text.length );
    console.log(thing);
    return thing;
  };
  return (
    <React.Fragment>
      {_.map(_.range(text.length), index => (
        <span
          key={index}
          style={{
            position: 'absolute',
            height: '100%',
            width: '100%',
            bottom: 0,
            transformOrigin: 'center',
            transform: `rotate(${getDegrees(index)}deg)`,
          }}
        >
          <span style={{position: 'absolute', bottom: 0}}>{text.charAt(index)}</span>
        </span>
      ))}
    </React.Fragment>
  );
}
