// @flow

import _ from 'lodash';

import dispatch, {
  addPlayer,
  addNode,
  addToken,
  clearStage,
  setPhase,
  setRelationships,
  setTokenNodeId,
  setTokenPosition,
} from '../state/actions';
import {
  getNode,
  getPhase,
  getPlayer,
  getSessionInfo,
  getToken,
} from '../state/getters';
import type { ServerState } from '../../../server/networkTypes';

export function socketConnect() {
  console.log('Feel the love connection!');
}

export function socketDisconnect() {
  console.log('Love never dies, but it seemed worth giving up this time');
}

export function updateState(serverState: ServerState) {
  // Ignore updates when phase isn't set or isn't the same as client phase
  const phase = getPhase();
  if (!phase || serverState.phase.name !== phase.name) return;

  console.log('update state');
  console.log('serverState', serverState);

  const { players, nodes, tokens } = serverState;
  const getIsNew = getObject => object => !getObject(object.id);
  const playerIsNew = getIsNew(getPlayer);
  const tokenIsNew = getIsNew(getToken);
  const nodeIsNew = getIsNew(getNode);

  const newPlayers = _.filter(players, playerIsNew);
  _.each(newPlayers, player =>
    dispatch(addPlayer(player.id, player.name, player.color))
  );
  const newNodes = _.filter(nodes, nodeIsNew);
  _.each(newNodes, node =>
    dispatch(addNode(node.id, node.type, node.playerIds))
  );
  const newTokens = _.filter(tokens, tokenIsNew);
  _.each(newTokens, token => dispatch(addToken(token.id, token.nodeId)));

  _.each(tokens, serverToken => {
    // Update if not an internal move (node playerIds haven't changed)
    const { id, nodeId: serverNodeId } = serverToken;
    const { nodeId } = getToken(id);

    if (serverNodeId !== nodeId) {
      // A transfer happened
      const { playerIds: serverPlayerIds } = nodes[serverNodeId];
      const { playerIds } = getNode(nodeId);
      const { playerId: currentPlayerId } = getSessionInfo();
      if (
        _.isEqual(serverPlayerIds, [currentPlayerId]) &&
        _.isEqual(playerIds, [currentPlayerId])
      ) {
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
  const { phase, players, nodes, relationships, tokens } = serverState;
  dispatch(setPhase(phase));
  dispatch(clearStage());
  _.each(players, (player, id) =>
    dispatch(addPlayer(id, player.name, player.color))
  );
  _.each(nodes, (node, id) => dispatch(addNode(id, node.type, node.playerIds)));
  _.each(tokens, (token, id) => dispatch(addToken(id, token.nodeId)));
  dispatch(setRelationships(relationships));
}