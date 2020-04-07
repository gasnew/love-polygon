// @flow

import Color from 'color';
import _ from 'lodash';
import stringToColor from 'string-to-color';

import type { Socket } from 'socket.io-client';

import type {
  CrushSelection,
  CrushSelections,
  Phase,
  Points,
  SessionInfo,
  TrueLoveSelection,
  TrueLoveSelections,
} from '../../../server/networkTypes';
import type {
  Need,
  Needs,
  Node,
  Nodes,
  Player,
  Players,
  Relationship,
  Relationships,
  State,
  Token,
  Tokens,
} from './state';

export function getState(): State {
  return window.state;
}

export function getPhase(): ?Phase {
  return getState().phase;
}

export function getSessionInfo(): SessionInfo {
  return getState().sessionInfo;
}

export function getSocket(): ?Socket {
  return getState().socket;
}

export function getCurrentTokenId(): ?string {
  return getState().currentTokenId;
}

export function getPartyLeader(): string {
  return getState().partyLeader;
}

export function getPlayerOrder(): string[] {
  return getState().playerOrder;
}

export function getCurrentVoter(): ?string {
  return getState().currentVoter;
}

export function getPlayers(): Players {
  return getState().players;
}

export function getPlayerReady(playerId: string): boolean {
  const loveBuckets = getLoveBuckets();
  return _.some(getPlayerTokens(playerId), token => loveBuckets[token.nodeId]);
}

export function getParticipatingPlayers(): Players {
  return _.pickBy(getState().players, 'inRound');
}

export function getInRound(): boolean {
  const player = getPlayer(getSessionInfo().playerId);
  return !!player && player.inRound;
}

export function getPlayer(playerId: string): Player {
  return getPlayers()[playerId];
}

export function generatePlayerColor(playerName: string): string {
  const somePastelColor = '#ffb7b2';
  return Color(somePastelColor)
    .rotate(Color(stringToColor(playerName)).hue())
    .hex();
}

export function getNodes(): Nodes {
  return getState().nodes;
}

export function getNode(nodeId: string): Node {
  return getNodes()[nodeId];
}

export function getPlayerNodes(playerId: string): Nodes {
  return _.pickBy(getNodes(), node => _.includes(node.playerIds, playerId));
}

export function getOwnNodes(): Nodes {
  const { playerId } = getSessionInfo();
  return getPlayerNodes(playerId);
}

export function getJarScale(): number {
  return 60;
}

export function getHeartScale(): number {
  return getJarScale() / 4;
}

export function getSlotScale(): number {
  return 90 / _.size(_.filter(getOwnNodes(), ['type', 'shared']));
}

function makeDimensions(
  getScale: () => number
): () => { width: string, height: string } {
  return () => ({ width: `${getScale()}vw`, height: `${getScale()}vw` });
}

export const getSlotDimensions = makeDimensions(getSlotScale);
export const getHeartDimensions = makeDimensions(getHeartScale);
export const getJarDimensions = makeDimensions(getJarScale);

export function getLoveBuckets(): Nodes {
  return _.pickBy(getNodes(), ['type', 'loveBucket']);
}

export function getTokens(): Tokens {
  return getState().tokens;
}

export function getToken(tokenId: string): Token {
  return getTokens()[tokenId];
}

export function getNodeToken(nodeId: string): ?Token {
  return _.find(getTokens(), ['nodeId', nodeId]);
}

export function getPlayerTokens(playerId: string): Tokens {
  const nodes = getPlayerNodes(playerId);
  return _.pickBy(getTokens(), token => nodes[token.nodeId]);
}

export function getOwnTokens(): Tokens {
  const { playerId } = getSessionInfo();
  return getPlayerTokens(playerId);
}

export function getRelationships(): Relationships {
  return getState().relationships;
}

export function getPlayerRelationship(playerId: string): Relationship {
  return _.find(getRelationships(), ['fromId', playerId]);
}

export function getOwnRelationship(): Relationship {
  const { playerId } = getSessionInfo();
  return getPlayerRelationship(playerId);
}

export function getNeeds(): Needs {
  return getState().needs;
}

export function getPlayerNeed(playerId: string): Need {
  return _.find(getNeeds(), ['playerId', playerId]);
}

export function getOwnNeed(): Need {
  const { playerId } = getSessionInfo();
  return getPlayerNeed(playerId);
}

export function getCrushSelections(): CrushSelections {
  return getState().crushSelections;
}

export function getPlayerCrushSelection(playerId: string): CrushSelection {
  return _.find(getCrushSelections(), ['playerId', playerId]);
}

export function getPlayerTrueLoveSelection(
  playerId: string
): TrueLoveSelection {
  return _.find(getTrueLoveSelections(), ['playerId', playerId]);
}

export function getOwnTrueLoveSelection(): ?TrueLoveSelection {
  const { playerId } = getSessionInfo();
  return getPlayerTrueLoveSelection(playerId);
}

export function getTrueLoveSelections(): TrueLoveSelections {
  return getState().trueLoveSelections;
}

export function getAllTrueLoveSelectionsFinished(): boolean {
  return _.every(getTrueLoveSelections(), 'finalized');
}

export function getVotingOrder(): string[] {
  return getState().votingOrder;
}

export function getNeedsMet(playerId: string): boolean {
  const nodes = getPlayerNodes(playerId);
  const storedTokens = _.pickBy(
    getPlayerTokens(playerId),
    token => nodes[token.nodeId].type === 'storage'
  );
  const need = getPlayerNeed(playerId) || {};
  return _.filter(storedTokens, ['type', need.type]).length >= need.count;
}

export function getGuessedCrushesCorrectly(playerId: string): boolean {
  const crushes = _.map(
    _.filter(
      getRelationships(),
      ({ type, toId }) => type === 'crush' && toId === playerId
    ),
    'fromId'
  );
  const guesses = getPlayerCrushSelection(playerId).playerIds;

  return _.isEqual(_.sortBy(crushes), _.sortBy(guesses));
}

export function getSecretLove(playerId: string): boolean {
  const relationship = getPlayerRelationship(playerId);
  const objectId =
    relationship.type === 'crush'
      ? relationship.toId
      : getPlayerRelationship(relationship.toId).toId;
  return getNeedsMet(objectId) && !getGuessedCrushesCorrectly(objectId);
}

export function getSelectedNamesFromPlayerId(playerId: string): string {
  return _.flow(
    playerId => getPlayerCrushSelection(playerId).playerIds,
    playerIds =>
      _.map(
        playerIds,
        _.flow(getPlayer, player => player.name)
      ),
    playerNames =>
      playerNames.length === 0 ? 'None' : _.join(playerNames, ', ')
  )(playerId);
}

export function getTrueLoveCouple(): string[] {
  return _.flow(
    relationships => _.filter(relationships, ['type', 'crush']),
    crushes =>
      _.filter(crushes, ({ fromId, toId }) =>
        _.some(crushes, crush => crush.toId === fromId && crush.fromId === toId)
      ),
    couple => _.map(couple, 'fromId')
  )(getRelationships());
}

export function getGuessedTrueLoveCorrectly(playerId: string): boolean {
  const trueLoveSelection = getPlayerTrueLoveSelection(playerId);
  const trueLoveCouple = getTrueLoveCouple();

  return _.isEqual(
    _.sortBy([trueLoveSelection.player1Id, trueLoveSelection.player2Id]),
    _.sortBy(trueLoveCouple)
  );
}

export function getRoundNumber(): number {
  return getState().roundNumber;
}

export function getPoints(): Points {
  return getState().points;
}

// WARNING: This is copied from server/states.js and *must* be kept up-to-date.
// We put this here instead of query-able via the API to keep things speedy
export const getNumberOfLovers = (numberOfPlayers: number): number => {
  if (numberOfPlayers <= 2) throw new Error('Nah, man! Too few folks for love');
  if (numberOfPlayers === 3) return 3;
  if (numberOfPlayers === 4) return 3;
  if (numberOfPlayers === 5) return 3;
  if (numberOfPlayers === 6) return 4;
  if (numberOfPlayers === 7) return 5;
  if (numberOfPlayers === 8) return 5;
  throw new Error('Whoa!! Too many folks for love. Let me breathe the air');
};

export function imageColorFilter(baseColor: Color, targetColor: Color): string {
  const hueRotation = targetColor.hue() - baseColor.hue();
  const colorBrightness =
    (targetColor.luminosity() - baseColor.luminosity() + 1) * 100;
  const saturation = targetColor.saturationl() - baseColor.saturationl() + 100;
  return `hue-rotate(${hueRotation}deg) brightness(${colorBrightness}%) saturate(${saturation}%)`;
}
