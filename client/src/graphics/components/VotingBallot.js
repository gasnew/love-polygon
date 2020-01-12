// @flow

import _ from 'lodash';
import Button from '@material-ui/core/Button';
import {
  Avatar,
  Card,
  CardActions,
  CardContent,
  ListItemAvatar,
  Typography,
} from '@material-ui/core';
import { BeachAccessIcon } from '@material-ui/icons/BeachAccess';
import { Cancel, CheckCircle, EmojiEmotions } from '@material-ui/icons';
import Checkbox from '@material-ui/core/Checkbox';
import CommentIcon from '@material-ui/icons/Comment';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import announce, {
  deselectPlayer,
  selectPlayer,
  submitVotes,
} from '../../network/network';
import dispatch, {
  setCurrentVoter,
  setPlayerCrushSelections,
} from '../../state/actions';
import {
  getCurrentVoter,
  getPlayerCrushSelections,
  getPlayers,
  getSessionInfo,
  getVotingOrder,
} from '../../state/getters';

import type { Player } from '../../state/state';

const usePlayerCardStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper,
  },
}));

const PlayerCardList = ({
  players,
}: {
  players: { name: string, status: string }[],
}) => {
  const { root } = usePlayerCardStyles();

  return (
    <List className={root}>
      {_.map(players, ({ name, status }) => (
        <ListItem key={name}>
          <ListItemAvatar>
            <Avatar>
              {status === 'success' ? (
                <CheckCircle />
              ) : status === 'failure' ? (
                <Cancel />
              ) : (
                <EmojiEmotions />
              )}
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary={name} secondary="bo, ba, bingo" />
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
  onClick: string => () => void,
}) => {
  const labelId = `checkbox-list-label-${player.id}`;

  return (
    <ListItem
      role={undefined}
      dense
      button
      onClick={onClick(player.id)}
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

export default function VotingBallot() {
  const classes = useStyles();

  const players = getPlayers();
  const currentVoter = getCurrentVoter();
  const votingOrder = getVotingOrder();
  const crushSelections = getPlayerCrushSelections(currentVoter);
  const { playerId: currentPlayerId } = getSessionInfo();

  if (!currentVoter) return <p>Loading...</p>;
  const playerify = playerId => players[playerId];
  const noteTaker = playerify(
    votingOrder[(votingOrder.indexOf(currentVoter) + 1) % votingOrder.length]
  );

  const handleToggle = playerId => () => {
    if (_.includes(crushSelections, playerId)) {
      dispatch(
        setPlayerCrushSelections(
          currentVoter,
          _.difference(crushSelections, [playerId])
        )
      );
      announce(networkedDeselectPlayer(playerId));
    } else {
      dispatch(setSelectedPlayers([...selectedPlayers, playerId]));
      announce(networkedSelectPlayer(playerId));
    }
  };

  const handleSubmitVotesClick = () => {
    dispatch(setSelectedPlayers([]));
    dispatch(setCurrentVoter(noteTaker.id));
    announce(submitVotes(currentVoter));
  };

  return (
    <div>
      <PlayerCardList
        players={_.map(
          votingOrder,
          _.flow(
            playerify,
            player => ({
              name: player.name,
              status: 'success',
            })
          )
        )}
      />
      <Card className={classes.card} variant="outlined">
        <CardContent>
          <Typography variant="h5" component="h2">
            {currentVoter === currentPlayerId ? (
              `Select the players you believe had a crush on you!`
            ) : (
              <span>
                <b>{playerify(currentVoter).name}</b> is deciding who has a
                crush on them...
              </span>
            )}
          </Typography>
          <Typography className={classes.pos} color="textSecondary">
            {`${noteTaker.name} is taking notes.`}
          </Typography>
          <List className={classes.root}>
            {_.map(_.reject(players, ['id', currentVoter]), player => (
              <PlayerCheckbox
                key={player.id}
                player={player}
                checked={_.includes(selectedPlayers, player.id)}
                disabled={noteTaker.id != currentPlayerId}
                onClick={handleToggle}
              />
            ))}
          </List>
        </CardContent>
        <CardActions>
          {noteTaker.id === currentPlayerId && (
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={handleSubmitVotesClick}
            >
              Submit Votes
            </Button>
          )}
        </CardActions>
      </Card>
    </div>
  );
}
