// @flow

import _ from 'lodash';
import React from 'react';
import { grey, green } from '@material-ui/core/colors';
import CircleFilled from '@material-ui/icons/FiberManualRecord';
import Flag from '@material-ui/icons/Flag';
import CircleOutline from '@material-ui/icons/RadioButtonUnchecked';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { makeStyles } from '@material-ui/core/styles';

import {
  getPartyLeader,
  getPlayerOrder,
  getPlayerReady,
  getPlayers,
} from '../../state/getters';

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper,
  },
}));

export default function PlayerList() {
  const classes = useStyles();

  const partyLeader = getPartyLeader();
  const players = getPlayers();
  const playerOrder = getPlayerOrder();

  return (
    <div className={classes.root}>
      <List component="nav" aria-label="main mailbox folders">
        {_.map(
          _.sortBy(players, player =>
            _.includes(playerOrder, player.id)
              ? playerOrder.indexOf(player.id)
              : playerOrder.length
          ),
          player => (
            <ListItem key={player.id}>
              <ListItemIcon style={{ minWidth: 40 }}>
                {player.id === partyLeader ? (
                  <Flag style={{ color: green[500] }} />
                ) : getPlayerReady(player.id) || player.inRound ? (
                  <CircleFilled style={{ color: green[500] }} />
                ) : (
                  <CircleOutline />
                )}
              </ListItemIcon>
              <ListItemText
                primary={player.name || <i>New Player</i>}
                style={{ color: grey[player.inRound ? 500 : 900] }}
              />
            </ListItem>
          )
        )}
      </List>
    </div>
  );
}
