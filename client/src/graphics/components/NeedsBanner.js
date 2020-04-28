// @flow

import React from 'react';
import { Motion, spring } from 'react-motion';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import { getItemImage } from './Item';
import announce, { finishRound } from '../../network/network';
import type { Need } from '../../state/state';

type Props = { need: Need, needsLeft: number, enabled: boolean };

const useStyles = makeStyles(theme => ({
  root: {
    fontFamily: theme.nicefont.fontFamily,
    textAlign: 'center',
  },
  crush: { color: '#FF0000', fontWeight: 'bold' },
}));

export default function NeedsBanner({ need, needsLeft, enabled }: Props) {
  const classes = useStyles();

  const Item = () => (
    <img
      alt="I am a delicious food"
      style={{ position: 'relative', top: 5, height: 30, width: 30 }}
      src={getItemImage(need.type)}
    />
  );
  return (
    <Paper
      elevation={3}
      square
      style={{
        padding: 10,
        display: 'flex',
        flexDirection: 'column',
        height: 100,
      }}
    >
      <Typography
        className={classes.root}
        style={{ margin: 'auto' }}
        variant="h5"
      >
        {needsLeft === 0 ? (
          <span>
            All <Item />s acquired!
          </span>
        ) : (
          <span>
            Need {needsLeft} more <Item />
          </span>
        )}
      </Typography>
      {needsLeft === 0 && (
        <Motion
          defaultStyle={{ height: 0 }}
          style={{
            height: spring(50),
          }}
        >
          {({ height }) => (
            <Button
              color="primary"
              variant="contained"
              disabled={!enabled}
              onClick={() => announce(finishRound())}
              style={{ height: `${height}%` }}
            >
              <Typography className={classes.root} variant="h5">
                {enabled ? 'End Round' : 'Round Ending...'}
              </Typography>
            </Button>
          )}
        </Motion>
      )}
    </Paper>
  );
}
