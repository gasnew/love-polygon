// @flow

import React from 'react';

import TextBox from './TextBox';
import type { Component } from './index';

type Props = {
  seconds: number,
};

export default function CountdownTimer({ seconds }: Props) {
  return <h1>{seconds}</h1>
}
