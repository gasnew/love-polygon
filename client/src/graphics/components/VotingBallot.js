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
import MuiAlert from '@material-ui/lab/Alert';
import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import announce, {
  deselectPlayer as networkedDeselectPlayer,
  selectPlayer as networkedSelectPlayer,
  submitVotes,
} from '../../network/network';
import dispatch, {
  deselectPlayer,
  selectPlayer,
  setCurrentVoter,
} from '../../state/actions';
import {
  getCurrentVoter,
  getGuessedCrushesCorrectly,
  getPlayerCrushSelection,
  getPlayers,
  getSessionInfo,
  getVotingOrder,
} from '../../state/getters';

import type { Player } from '../../state/state';

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const usePlayerCardStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper,
  },
}));

type PlayerCard = { name: string, selectedNames: string[], status: string };
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
          <ListItemText
            primary={name}
            secondary={_.join(selectedNames, ', ')}
          />
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
  const [snackbar, setSnackbar] = useState({
    playerId: '',
    severity: '',
    message: '',
  });
  const { open, handleClose, activateSnackbar } = useSnackbar();
  const classes = useStyles();

  const players = getPlayers();
  const currentVoter = getCurrentVoter();

  if (!currentVoter) return <p>Loading...</p>;

  const votingOrder = getVotingOrder();
  const selectedPlayerIds = getPlayerCrushSelection(currentVoter).playerIds;
  const { playerId: currentPlayerId } = getSessionInfo();

  const playerify = playerId => players[playerId];
  const noteTaker = playerify(
    votingOrder[(votingOrder.indexOf(currentVoter) + 1) % votingOrder.length]
  );

  const handleToggle = playerId => () => {
    if (_.includes(selectedPlayerIds, playerId)) {
      dispatch(deselectPlayer(currentVoter, playerId));
      announce(networkedDeselectPlayer(currentVoter, playerId));
    } else {
      dispatch(selectPlayer(currentVoter, playerId));
      announce(networkedSelectPlayer(currentVoter, playerId));
    }
  };

  const handleSubmitVotesClick = () => {
    dispatch(setCurrentVoter(noteTaker.id));
    announce(submitVotes(currentVoter));
  };

  const hasVoted = playerId =>
    _.includes(
      votingOrder.slice(0, votingOrder.indexOf(currentVoter)),
      playerId
    );
  const playerCardFromPlayerId = _.flow(
    playerify,
    player => ({
      name: player.name,
      selectedNames: _.map(
        getPlayerCrushSelection(player.id).playerIds,
        _.flow(
          playerify,
          player => player.name
        )
      ),
      status: hasVoted(player.id)
        ? getGuessedCrushesCorrectly(player.id)
          ? 'success'
          : 'failure'
        : 'tbd',
    })
  );

  // Activate the snackbar whenever a new vote is in
  if (
    votingOrder.indexOf(currentVoter) >= 1 &&
    snackbar.playerId !== votingOrder[votingOrder.indexOf(currentVoter) -1]
  ) {
    const previousVoter = votingOrder[votingOrder.indexOf(currentVoter) -1];
    if (getGuessedCrushesCorrectly(previousVoter))
      setSnackbar({
        playerId: previousVoter,
        severity: 'success',
        message: `${
          playerify(previousVoter).name
        } correctly guessed the exact set of players who have a crush on them!`,
      });
    else
      setSnackbar({
        playerId: previousVoter,
        severity: 'error',
        message: `${
          playerify(previousVoter).name
        } did not correctly guess the exact set of players who have a crush on them :(`,
      });
    activateSnackbar();
  }

  return (
    <div>
      <PlayerCardList
        playerCards={_.map(
          votingOrder.slice(0, votingOrder.indexOf(currentVoter)),
          playerCardFromPlayerId
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
                checked={_.includes(selectedPlayerIds, player.id)}
                disabled={noteTaker.id !== currentPlayerId}
                onClick={handleToggle(player.id)}
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
      <PlayerCardList
        playerCards={_.map(
          votingOrder.slice(
            votingOrder.indexOf(currentVoter) + 1,
            votingOrder.length
          ),
          playerCardFromPlayerId
        )}
      />
      <Snackbar open={open} onClose={handleClose}>
        <Alert onClose={handleClose} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}
