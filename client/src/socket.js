// @flow

import _, { map } from 'lodash';

import dispatch, {
  addPlayer,
  addNode,
  addToken,
  clearStage,
  setPhase,
  setTokenNodeId,
  setTokenPosition,
} from './actions';
import { getNode, getPlayer, getSessionInfo, getToken } from './getters';
import type { ServerState, SubServerState } from '../../server/networkTypes';

export function socketConnect() {
  console.log('Feel the love connection!');
}

export function socketDisconnect() {
  console.log('Love never dies, but it seemed worth giving up this time');
}

export function updateState(serverState: ServerState) {
  console.log('update state');
  console.log('serverState', serverState);

  const { players, nodes, tokens } = serverState;
  const getIsNew = getObject => object => !getObject(object.id);
  const playerIsNew = getIsNew(getPlayer);
  const tokenIsNew = getIsNew(getToken);
  const nodeIsNew = getIsNew(getNode);

  const newPlayers = _.filter(players, playerIsNew);
  _.each(newPlayers, player => dispatch(addPlayer(player.id, player.name)));
  const newNodes = _.filter(nodes, nodeIsNew);
  _.each(newNodes, node =>
    dispatch(addNode(node.id, node.type, node.playerId))
  );
  const newTokens = _.filter(tokens, tokenIsNew);
  _.each(newTokens, token => dispatch(addToken(token.id, token.nodeId)));

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
  const { phase, players, nodes, tokens } = serverState;
  dispatch(setPhase(phase));
  dispatch(clearStage());
  _.each(players, (player, id) => dispatch(addPlayer(id, player.name)));
  _.each(nodes, (node, id) => dispatch(addNode(id, node.type, node.playerId)));
  _.each(tokens, (token, id) => dispatch(addToken(id, token.nodeId)));
}
