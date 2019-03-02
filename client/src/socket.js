// @flow

import _ from 'lodash';

import dispatch, { addPlayer, addNode, addToken } from './actions';
import { getNode, getPlayer, getToken } from './getters';

export function socketConnect() {
  console.log('Feel the love connection!');
}

export function socketDisconnect() {
  console.log('Love never dies, but it seemed worth giving up this time');
}

type ServerState = {
  players: {
    [string]: {
      id: string,
      name: string,
      active: string,
    },
  },
  nodes: {
    [string]: {
      id: string,
      playerId: string,
    },
  },
  tokens: {
    [string]: {
      id: string,
      nodeId: string,
    },
  },
};

export function updateState(serverState: ServerState) {
  console.log('new state received');
  const { players, nodes, tokens } = serverState;
  console.log('serverState', serverState);
  const getNew = (objects, get) => _.filter(objects, object => !get(object.id));
  const addNew = (objects, add) =>
    _.each(objects, object => dispatch(add(object)));
  addNew(getNew(players, getPlayer), player =>
    addPlayer(player.id, player.name)
  );
  addNew(getNew(nodes, getNode), node => addNode(node.id, node.playerId));
  addNew(getNew(tokens, getToken), token => addToken(token.id, token.nodeId));
  //_.each(nodes, (serverNode, id) => {
  //// Add node if it doesn't exist
  //const node = getNode(id);
  //if (!node) dispatch(addNode(id, serverNode.playerId));
  //// Update if not an internal move (node playerIds haven't changed)
  //});
}

export function setState(serverState: ServerState) {
  console.log('state set');
  console.log(serverState);
  const { players, nodes, tokens } = serverState;
  _.each(players, (player, id) => dispatch(addPlayer(id, player.name)));
  _.each(nodes, (node, id) => dispatch(addNode(id, node.playerId)));
  _.each(tokens, (token, id) => dispatch(addToken(id, token.nodeId)));
}
