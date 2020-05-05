// @flow

import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import { getPlayer } from '../../state/getters';

type Props = {
  playerId: string,
};

const useStyles = makeStyles(theme => ({
  tag: {
    fontFamily: theme.nicefont.fontFamily,
    fontWeight: 'bold',
    paddingLeft: 5,
    paddingRight: 5,
    borderRadius: '0.5rem',
  },
}));

export default function NameTag({ playerId }: Props) {
  const classes = useStyles();
  const player = getPlayer(playerId);
  return (
    <Typography
      className={classes.tag}
      style={{ backgroundColor: player.color }}
      component="span"
      variant="inherit"
    >
      {player.name || <i>New Player</i>}
    </Typography>
  );
}
