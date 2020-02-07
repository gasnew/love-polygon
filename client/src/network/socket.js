// @flow

import _ from 'lodash';

import dispatch, {
  silentDispatch,
  addPlayer,
  addNode,
  addToken,
  clearStage,
  setCrushSelections,
  setCurrentTokenId,
  setCurrentVoter,
  setNeeds,
  setPartyLeader,
  setPhase,
  setPlayerName,
  setRelationships,
  setTokenNodeId,
  setVotingOrder,
  startCountdown,
} from '../state/actions';
import {
  getCurrentTokenId,
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

  const {
    crushSelections,
    partyLeader,
    players,
    nodes,
    tokens,
    currentVoter,
    votingOrder,
  } = serverState;
  const getIsNew = getObject => object => !getObject(object.id);
  const playerIsNew = getIsNew(getPlayer);
  const tokenIsNew = getIsNew(getToken);
  const nodeIsNew = getIsNew(getNode);

  const newPlayers = _.filter(players, playerIsNew);
  _.each(newPlayers, player =>
    silentDispatch(
      addPlayer(player.id, player.name, player.color, player.inRound)
    )
  );
  _.each(_.reject(players, ['id', getSessionInfo().playerId]), player =>
    silentDispatch(setPlayerName(player.id, player.name))
  );
  const newNodes = _.filter(nodes, nodeIsNew);
  _.each(newNodes, node =>
    silentDispatch(addNode(node.id, node.type, node.playerIds, node.enabled))
  );
  const newTokens = _.filter(tokens, tokenIsNew);
  _.each(newTokens, token =>
    silentDispatch(addToken(token.id, token.type, token.nodeId))
  );

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
      silentDispatch(setTokenNodeId(id, serverNodeId));
      if (id === getCurrentTokenId()) silentDispatch(setCurrentTokenId(null));
    }
  });

  silentDispatch(setPartyLeader(partyLeader));
  silentDispatch(setVotingOrder(votingOrder));
  silentDispatch(setCrushSelections(crushSelections));
  // NOTE: We only call `dispatch` for the last update so that the event to
  // re-render the React components only gets fired once
  dispatch(setCurrentVoter(currentVoter));
}

export function setState(serverState: ServerState) {
  console.log('state set');
  console.log(serverState);
  const {
    crushSelections,
    currentVoter,
    partyLeader,
    phase,
    players,
    needs,
    nodes,
    relationships,
    tokens,
    votingOrder,
  } = serverState;
  const { playerId: currentPlayerId } = getSessionInfo();
  if (phase.name === 'countdown' && (getPhase() || {}).name !== 'countdown')
    silentDispatch(startCountdown());
  silentDispatch(setPhase(phase.name));
  silentDispatch(clearStage());
  _.each(players, (player, id) =>
    silentDispatch(addPlayer(id, player.name, player.color, player.inRound))
  );
  silentDispatch(
    setPlayerName(
      currentPlayerId,
      _.includes(_.map(players, 'id'), currentPlayerId)
        ? _.find(players, ['id', currentPlayerId]).name
        : ''
    )
  );
  _.each(nodes, (node, id) =>
    silentDispatch(addNode(id, node.type, node.playerIds, node.enabled))
  );
  _.each(tokens, (token, id) =>
    silentDispatch(addToken(id, token.type, token.nodeId))
  );
  silentDispatch(setNeeds(needs));
  silentDispatch(setRelationships(relationships));
  silentDispatch(setPartyLeader(partyLeader));
  silentDispatch(setVotingOrder(votingOrder));
  silentDispatch(setCrushSelections(crushSelections));
  // NOTE: We only call `dispatch` for the last update so that the event to
  // re-render the React components only gets fired once
  dispatch(setCurrentVoter(currentVoter));
}
