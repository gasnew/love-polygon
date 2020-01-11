// @flow

import _ from 'lodash';
import Button from '@material-ui/core/Button';
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
  setSelectedPlayers,
} from '../../state/actions';
import {
  getCurrentVoter,
  getPlayers,
  getSelectedPlayers,
  getSessionInfo,
  getVotingOrder,
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
}));

export default function VotingBallot() {
  const classes = useStyles();

  const players = getPlayers();
  const currentVoter = getCurrentVoter();
  const votingOrder = getVotingOrder();
  const selectedPlayers = getSelectedPlayers();
  const { playerId } = getSessionInfo();

  if (!currentVoter) return <p>Loading...</p>;
  const noteTaker =
    players[
      votingOrder[(votingOrder.indexOf(currentVoter) + 1) % votingOrder.length]
    ];

  const handleToggle = playerId => () => {
    if (_.includes(selectedPlayers, playerId)) {
      dispatch(setSelectedPlayers(_.difference(selectedPlayers, [playerId])));
      announce(deselectPlayer(playerId));
    } else {
      dispatch(setSelectedPlayers([...selectedPlayers, playerId]));
      announce(selectPlayer(playerId));
    }
  };

  const handleSubmitVotesClick = () => {
    dispatch(setSelectedPlayers([]));
    dispatch(setCurrentVoter(noteTaker.id));
    announce(submitVotes(currentVoter));
  };

  return (
    <div>
      <p>
        {currentVoter === playerId
          ? `Select the players you believe had a crush on you!`
          : `${players[currentVoter].name} is deciding who has a crush on them...`}
      </p>
      <p>
        <i>{`${noteTaker.name} is taking notes.`}</i>
      </p>
      <List className={classes.root}>
        {_.map(_.reject(players, ['id', currentVoter]), player => (
          <PlayerCheckbox
            key={player.id}
            player={player}
            checked={_.includes(selectedPlayers, player.id)}
            disabled={noteTaker.id != playerId}
            onClick={handleToggle}
          />
        ))}
      </List>
      {noteTaker.id === playerId && (
        <Button
          fullWidth
          variant="contained"
          color="primary"
          onClick={handleSubmitVotesClick}
        >
          Submit Votes
        </Button>
      )}
    </div>
  );
}
