// @flow

import _ from 'lodash';
import React from 'react';
import Button from '@material-ui/core/Button';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import ArrowUpward from '@material-ui/icons/ArrowUpward';
import ArrowDownward from '@material-ui/icons/ArrowDownward';
import Stop from '@material-ui/icons/Stop';

import { ROUND_COUNT } from '../../constants';
import announce, { returnToLobby, startNextRound } from '../../network/network';
import {
  getCrushSelections,
  getGuessedCrushesCorrectly,
  getGuessedTrueLoveCorrectly,
  getPartyLeader,
  getPlayer,
  getPlayerRelationship,
  getPoints,
  getRoundNumber,
  getSecretLove,
  getSelectedNamesFromPlayerId,
  getSessionInfo,
  getNeedsMet,
  getParticipatingPlayers,
} from '../../state/getters';

type PlaceDeltaProps = {
  direction: number,
};

function PlaceDelta({ direction }: PlaceDeltaProps) {
  if (direction === 1) return <ArrowUpward />;
  if (direction === -1) return <ArrowDownward />;
  if (direction === 0) return <span></span>;
  return <span>?</span>;
}

export default function ResultsTable() {
  if (_.isEmpty(getCrushSelections())) return <p>Loading...</p>;

  const { playerId } = getSessionInfo();
  const partyLeader = getPartyLeader();
  const roundNumber = getRoundNumber();
  const points = getPoints();
  const playerResults = _.mapValues(getParticipatingPlayers(), player => ({
    player,
    relationship: _.flow(({ type, toId }) =>
      type === 'crush'
        ? `Crush on ${getPlayer(toId).name}`
        : `Wingman for ${getPlayer(toId).name}`
    )(getPlayerRelationship(player.id)),
    crushSelection: getSelectedNamesFromPlayerId(player.id),
    needsMetPoints: getNeedsMet(player.id) ? 1 : 0,
    guessedCrushesPoints: getGuessedCrushesCorrectly(player.id) ? 2 : 0,
    secretLovePoints: getSecretLove(player.id) ? 3 : 0,
    trueLovePoints: getGuessedTrueLoveCorrectly(player.id) ? 5 : 0,
  }));

  const stringifyPoints = points => (points === 0 ? '-' : `+${points}`);
  const newPoints = result =>
    result.needsMetPoints +
    result.guessedCrushesPoints +
    result.secretLovePoints +
    result.trueLovePoints;
  const previousPoints = result => points[result.player.id] || 0;
  const total = result => previousPoints(result) + newPoints(result);

  const place = (allPoints, point) =>
    allPoints.length + 1 - _.sortedLastIndex(_.sortBy(allPoints), point);
  const places = _.mapValues(playerResults, result => ({
    place: place(_.map(playerResults, total), total(result)),
    previousPlace: place(
      _.map(playerResults, previousPoints),
      previousPoints(result)
    ),
  }));
  const normalize = value => (value === 0 ? 0 : value / Math.abs(value));

  const handleStartNextRound = () => {
    announce(startNextRound(playerId));
  };
  const handleReturnToLobby = () => {
    announce(returnToLobby(playerId));
  };

  return (
    <div style={{ height: '100%', overflow: 'scroll' }}>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Place</TableCell>
              <TableCell>Player name</TableCell>
              <TableCell>Relationship</TableCell>
              <TableCell>Crush selection</TableCell>
              <TableCell align="center">Needs met</TableCell>
              <TableCell align="center">Guessed all lovers</TableCell>
              <TableCell align="center">Secret love</TableCell>
              {roundNumber === ROUND_COUNT && (
                <TableCell align="center">Guessed true love</TableCell>
              )}
              <TableCell align="center">Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {_.map(_.reverse(_.sortBy(playerResults, total)), result => (
              <TableRow key={result.player.name}>
                <TableCell component="th" scope="row">
                  {_.flow(({ place, previousPlace }) => (
                    <span>
                      {place}
                      {roundNumber !== 1 && (
                        <PlaceDelta
                          direction={normalize(previousPlace - place)}
                        />
                      )}
                    </span>
                  ))(places[result.player.id])}
                </TableCell>
                <TableCell component="th" scope="row">
                  {result.player.name}
                </TableCell>
                <TableCell>{result.relationship}</TableCell>
                <TableCell>{result.crushSelection}</TableCell>
                <TableCell align="center">
                  {stringifyPoints(result.needsMetPoints)}
                </TableCell>
                <TableCell align="center">
                  {stringifyPoints(result.guessedCrushesPoints)}
                </TableCell>
                <TableCell align="center">
                  {stringifyPoints(result.secretLovePoints)}
                </TableCell>
                {roundNumber === ROUND_COUNT && (
                  <TableCell align="center">
                    {stringifyPoints(result.trueLovePoints)}
                  </TableCell>
                )}
                <TableCell align="center">{total(result)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {playerId === partyLeader && roundNumber < ROUND_COUNT && (
        <Button
          fullWidth
          variant="contained"
          color="primary"
          onClick={handleStartNextRound}
        >
          {roundNumber < ROUND_COUNT - 1
            ? `Start Round ${roundNumber + 1}!`
            : 'Start Final Round!'}
        </Button>
      )}
      {playerId === partyLeader && roundNumber === ROUND_COUNT && (
        <Button
          fullWidth
          variant="contained"
          color="secondary"
          onClick={handleReturnToLobby}
        >
          Return to Lobby
        </Button>
      )}
    </div>
  );
}
