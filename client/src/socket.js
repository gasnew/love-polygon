// @flow

export function socketConnect() {
  console.log('Feel the love connection!');
}

export function socketDisconnect() {
  console.log('Love never dies, but it seemed worth giving up this time');
}

type ServerState = {
};

export function updateState(serverState: ServerState) {
  console.log('new state received');
  console.log(serverState);
}

export function setState(serverState: ServerState) {
  console.log('state rejected');
  console.log(serverState);
}
