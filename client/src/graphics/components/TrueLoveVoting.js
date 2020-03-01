// @flow

import _ from 'lodash';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Checkbox from '@material-ui/core/Checkbox';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

import announce, {
  deselectTrueLove as networkedDeselectTrueLove,
  selectTrueLove as networkedSelectTrueLove,
  submitTrueLoveSelections as networkedSubmitTrueLoveSelections,
  seeResults,
} from '../../network/network';
import dispatch, {
  deselectTrueLove,
  selectTrueLove,
  submitTrueLoveSelections,
} from '../../state/actions';
import {
  getAllTrueLoveSelectionsFinished,
  getGuessedTrueLoveCorrectly,
  getPartyLeader,
  getPlayerTrueLoveSelection,
  getParticipatingPlayers,
  getSessionInfo,
} from '../../state/getters';

import type { Player } from '../../state/state';

const PlayerCheckbox = ({
  player,
  checked,
  disabled,
  onClick,
}: {
  player: Player,
  checked: boolean,
  disabled: boolean,
  onClick: () => void,
}) => {
  const labelId = `checkbox-list-label-${player.id}`;

  return (
    <ListItem
      role={undefined}
      dense
      button
      onClick={onClick}
      disabled={disabled}
    >
      <ListItemIcon>
        <Checkbox
          edge="start"
          checked={checked}
          tabIndex={-1}
          inputProps={{ 'aria-labelledby': labelId }}
        />
      </ListItemIcon>
      <ListItemText id={labelId} primary={player.name} />
    </ListItem>
  );
};

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper,
  },
  card: {
    minWidth: 275,
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },
}));


export default function TrueLoveVoting() {
  const classes = useStyles();

  const partyLeader = getPartyLeader();

  if (!partyLeader) return <p>Loading...</p>;

  const { playerId: currentPlayerId } = getSessionInfo();
  const trueLoveSelection = getPlayerTrueLoveSelection(currentPlayerId);
  const players = getParticipatingPlayers();

  const handleSubmitTrueLoveSelections = () => {
    const { player1Id, player2Id } = trueLoveSelection;
    if (!player1Id || !player2Id) return;
    dispatch(submitTrueLoveSelections(currentPlayerId, player1Id, player2Id));
    announce(
      networkedSubmitTrueLoveSelections(currentPlayerId, player1Id, player2Id)
    );
  };
  const handleShowFinalResults = () => {
    announce(seeResults(currentPlayerId));
  };

  const isChecked = playerId =>
    playerId === trueLoveSelection.player1Id ||
    playerId === trueLoveSelection.player2Id;
  const bothSelectionsMade = !!(
    trueLoveSelection.player1Id && trueLoveSelection.player2Id
  );
  const allTrueLoveSelectionsFinished = getAllTrueLoveSelectionsFinished();

  const handleToggle = playerId => () => {
    if (isChecked(playerId)) {
      dispatch(deselectTrueLove(currentPlayerId, playerId));
      announce(networkedDeselectTrueLove(currentPlayerId, playerId));
    } else {
      dispatch(selectTrueLove(currentPlayerId, playerId));
      announce(networkedSelectTrueLove(currentPlayerId, playerId));
    }
  };

  return (
    <Card className={classes.card} variant="outlined">
      <CardContent>
        <Typography variant="h5" component="h2">
          This round included just one "true love" couple!
        </Typography>
        <Typography className={classes.pos} color="textSecondary">
          <i>Select the players you think had a crush on one another</i>
        </Typography>
        <List className={classes.root}>
          {_.map(players, player => (
            <PlayerCheckbox
              key={player.id}
              player={player}
              checked={isChecked(player.id)}
              disabled={
                (bothSelectionsMade && !isChecked(player.id)) ||
                allTrueLoveSelectionsFinished
              }
              onClick={handleToggle(player.id)}
            />
          ))}
        </List>
      </CardContent>
      {!allTrueLoveSelectionsFinished && (
        <CardActions>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            disabled={!bothSelectionsMade || trueLoveSelection.finalized}
            onClick={handleSubmitTrueLoveSelections}
          >
            {trueLoveSelection.finalized
              ? 'Waiting for other players...'
              : 'Submit True Love Selections'}
          </Button>
        </CardActions>
      )}
      {allTrueLoveSelectionsFinished && (
        <CardContent>
          {getGuessedTrueLoveCorrectly(currentPlayerId)
            ? 'You got it right!!!'
            : 'Nope :/'}
        </CardContent>
      )}
      {currentPlayerId === partyLeader && allTrueLoveSelectionsFinished && (
        <CardActions>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={handleShowFinalResults}
          >
            See Final Results
          </Button>
        </CardActions>
      )}
    </Card>
  );
}
