// @flow

import React from 'react';

type Props = {
  seconds: number,
};

export default function CountdownTimer({ seconds }: Props) {
  return <h1>{seconds}</h1>
}
