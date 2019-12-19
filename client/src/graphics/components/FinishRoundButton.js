// @flow

import React from 'react';

import announce, { finishRound } from '../../network/network';

type Props = {
  needType: string,
};

export default function FinishRoundButton({ needType }: Props) {
  return (
    <button type="button" onClick={() => announce(finishRound())}>
      <h3>Lock in {needType} and</h3>
      <h1>END ROUND</h1>
    </button>
  );
}
