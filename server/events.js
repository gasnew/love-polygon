// @flow

import _ from 'lodash';

export type Emitter = string => void;
type Callback = () => any;
type Events = {
  dispatch: Emitter,
  callbacks: {
    [string]: Callback[],
  },
};

function createEvents(callbacks = {}): Events {
  return {
    dispatch: eventName => {
      if (!callbacks[eventName]) return;
      _.each(callbacks[eventName], callback => callback());
    },
    callbacks,
  };
}

function register(events, eventName, callback) {
  return createEvents({
    ...events.callbacks,
    [eventName]: [...(events.callbacks[eventName] || []), callback],
  });
}

type EventsBuilder<T> = {
  call: T => any,
  register: (string, Callback) => EventsBuilder<T>,
};

export default function withEvents<T>(
  action: (T & { emit: Emitter }) => any,
  events: Events = createEvents()
): EventsBuilder<T> {
  return {
    call: props => action({ ...props, emit: events.dispatch }),
    register: (eventName, callback) =>
      withEvents(action, register(events, eventName, callback)),
  };
}
