// @flow

import _ from 'lodash';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Snackbar from '@material-ui/core/Snackbar';
import Typography from '@material-ui/core/Typography';
import Cancel from '@material-ui/icons/Cancel';
import CheckCircle from '@material-ui/icons/CheckCircle';
import EmojiEmotions from '@material-ui/icons/EmojiEmotions';
import Checkbox from '@material-ui/core/Checkbox';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Alert from '@material-ui/lab/Alert';
import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import announce, {
  deselectTrueLove as networkedDeselectTrueLove,
  selectTrueLove as networkedSelectTrueLove,
  submitVotes as networkedSubmitVotes,
  seeResults,
} from '../../network/network';
import dispatch, {
  deselectTrueLove,
  selectTrueLove,
} from '../../state/actions';
import {
  getAllTrueLoveSelectionsFinished,
  getCurrentVoter,
  getGuessedCrushesCorrectly,
  getGuessedTrueLoveCorrectly,
  getPartyLeader,
  getPlayerCrushSelection,
  getPlayerTrueLoveSelection,
  getParticipatingPlayers,
  getSelectedNamesFromPlayerId,
  getSessionInfo,
  getVotingOrder,
} from '../../state/getters';
import VotingConfirmationDialog from './VotingConfirmationDialog';

import type { Player } from '../../state/state';

const usePlayerCardStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper,
  },
}));

type PlayerCard = { name: string, selectedNames: string, status: string };
const PlayerCardList = ({ playerCards }: { playerCards: PlayerCard[] }) => {
  const { root } = usePlayerCardStyles();

  return (
    <List className={root}>
      {_.map(playerCards, ({ name, selectedNames, status }) => (
        <ListItem key={name}>
          <ListItemAvatar>
            {status === 'success' ? (
              <CheckCircle style={{ color: '67ac5c' }} />
            ) : status === 'failure' ? (
              <Cancel style={{ color: 'e25141' }} />
            ) : (
              <EmojiEmotions style={{ color: '888888' }} />
            )}
          </ListItemAvatar>
          <ListItemText primary={name} secondary={selectedNames} />
        </ListItem>
      ))}
    </List>
  );
};

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

const useSnackbar = () => {
  const [open, setOpen] = useState(false);

  const activateSnackbar = () => {
    setOpen(true);
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

  return { open, handleClose, activateSnackbar };
};

export default function VotingBallot() {
  const classes = useStyles();

  const partyLeader = getPartyLeader();

  if (!partyLeader) return <p>Loading...</p>;

  const { playerId: currentPlayerId } = getSessionInfo();
  const trueLoveSelection = getPlayerTrueLoveSelection(currentPlayerId);
  const players = getParticipatingPlayers();

  const playerify = playerId => players[playerId];

  const handleShowFinalResults = () => {
    announce(seeResults(currentPlayerId));
  };

  const hasVoted = playerId => getPlayerCrushSelection(playerId).finalized;
  const playerCardFromPlayerId = _.flow(playerify, player => ({
    name: player.name,
    selectedNames: getSelectedNamesFromPlayerId(player.id),
    status: hasVoted(player.id)
      ? getGuessedCrushesCorrectly(player.id)
        ? 'success'
        : 'failure'
      : 'tbd',
  }));

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
