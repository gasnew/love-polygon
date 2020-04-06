// @flow

import React, { useState, useEffect, useRef } from 'react';

// Shamelessly copied from Abramov's blog:
// https://overreacted.io/making-setinterval-declarative-with-react-hooks/
export function useInterval(callback: () => void, delay: number) {
  const savedCallback = useRef();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      if (savedCallback.current) savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

type Props = {
  startedAt: number,
};

export default function CountdownTimer({ startedAt }: Props) {
  const [seconds, setSeconds] = useState(15);

  useInterval(
    () => setSeconds(Math.ceil(15 - (Date.now() - (startedAt || 0)) / 1000)),
    0.5
  );

  return <h1>{seconds}</h1>;
}
