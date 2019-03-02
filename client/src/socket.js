// @flow

import _ from 'lodash';

import dispatch, {
  addPlayer,
  addNode,
  addToken,
  setTokenNodeId,
  setTokenPosition,
} from './actions';
import { getNode, getPlayer, getSessionInfo, getToken } from './getters';

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
  console.log('update state');
  console.log('serverState', serverState);
  const { players, nodes, tokens } = serverState;
  const getNew = (objects, get) => _.filter(objects, object => !get(object.id));
  const addNew = (objects, add) =>
    _.each(objects, object => dispatch(add(object)));
  addNew(getNew(players, getPlayer), player =>
    addPlayer(player.id, player.name)
  );
  addNew(getNew(nodes, getNode), node => addNode(node.id, node.playerId));
  addNew(getNew(tokens, getToken), token => addToken(token.id, token.nodeId));

  _.each(tokens, serverToken => {
    // Update if not an internal move (node playerIds haven't changed)
    const { id, nodeId: serverNodeId } = serverToken;
    const { nodeId } = getToken(id);

    if (serverNodeId !== nodeId) {
      const { playerId: serverPlayerId } = nodes[serverNodeId];
      const { playerId } = getNode(nodeId);
      const { playerId: currentPlayerId } = getSessionInfo();
      if (serverPlayerId === currentPlayerId && playerId === currentPlayerId) {
        // This transfer is internal to the current player. The server is
        // likely just lagging behind the client here.
        return;
      }
      console.log('transfer record now!', nodeId, serverNodeId);
      dispatch(setTokenNodeId(id, serverNodeId));
      const serverNode = getNode(serverNodeId);
      dispatch(
        setTokenPosition(id, serverNode.position.x, serverNode.position.y)
      );
    }
  });
}

export function setState(serverState: ServerState) {
  console.log('state set');
  console.log(serverState);
  const { players, nodes, tokens } = serverState;
  _.each(players, (player, id) => dispatch(addPlayer(id, player.name)));
  _.each(nodes, (node, id) => dispatch(addNode(id, node.playerId)));
  _.each(tokens, (token, id) => dispatch(addToken(id, token.nodeId)));
}
