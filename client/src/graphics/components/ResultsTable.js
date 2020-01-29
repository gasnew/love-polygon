// @flow

import _ from 'lodash';
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

import {
  getCrushSelections,
  getGuessedCrushesCorrectly,
  getPlayer,
  getPlayerRelationship,
  getSecretLove,
  getSelectedNamesFromPlayerId,
  getNeedsMet,
  getPlayers,
} from '../../state/getters';

export default function ResultsTable() {
  if (_.isEmpty(getCrushSelections())) return <p>Loading...</p>;

  const playerResults = _.map(getPlayers(), player => ({
    playerName: player.name,
    relationship: _.flow(({ type, toId }) =>
      type === 'crush'
        ? `Crush on ${getPlayer(toId).name}`
        : `Wingman for ${getPlayer(toId).name}`
    )(getPlayerRelationship(player.id)),
    crushSelection: getSelectedNamesFromPlayerId(player.id),
    needsMetPoints: getNeedsMet(player.id) ? 1 : 0,
    guessedCrushesPoints: getGuessedCrushesCorrectly(player.id) ? 2 : 0,
    secretLovePoints: getSecretLove(player.id) ? 3 : 0,
  }));

  const stringifyPoints = points => (points === 0 ? '-' : `+${points}`);
  const total = result =>
    result.needsMetPoints +
    result.guessedCrushesPoints +
    result.secretLovePoints;

  return (
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
            <TableCell align="center">Total</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {_.map(
            _.zip(
              _.reverse(_.sortBy(playerResults, total)),
              _.range(playerResults.length)
            ),
            ([result, index]) => (
              <TableRow key={result.playerName}>
                <TableCell component="th" scope="row">
                  {index + 1}
                </TableCell>
                <TableCell component="th" scope="row">
                  {result.playerName}
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
                <TableCell align="center">{total(result)}</TableCell>
              </TableRow>
            )
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
