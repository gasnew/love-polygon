// @flow

import _ from 'lodash';
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Divider from '@material-ui/core/Divider';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

import PlayerList from './PlayerList';
import { PLAYER_COUNT_MIN } from '../../constants';
import {
  getNumberOfLovers,
  getPartyLeader,
  getPlayerReady,
  getPlayer,
  getPlayers,
  getSessionInfo,
} from '../../state/getters';

const getRoleCounts = participatingPlayerCount => {
  try {
    const crushCount = getNumberOfLovers(participatingPlayerCount);
    return {
      crushCount,
      wingmanCount: participatingPlayerCount - crushCount,
    };
  } catch {
    return {
      crushCount: 0,
      wingmanCount: 0,
    };
  }
};

const useStyles = makeStyles({
  root: {},
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
  },
  title: {
    fontSize: 15,
    textAlign: 'center',
    fontFamily: "'Baloo Paaji 2', cursive",
  },
  pos: {
    marginBottom: 12,
  },
});

type Props = {
  onClick: () => void,
};

export default function OutlinedCard({ onClick }: Props) {
  const classes = useStyles();

  const isPartyLeader = getSessionInfo().playerId === getPartyLeader();
  const participatingPlayerCount = _.size(
    _.filter(getPlayers(), player => getPlayerReady(player.id))
  );
  const canStartRound = participatingPlayerCount >= PLAYER_COUNT_MIN;
  const { crushCount, wingmanCount } = getRoleCounts(participatingPlayerCount);

  return (
    <Card className={classes.root} variant="outlined">
      <CardContent style={{ padding: 4 }}>
        <div style={{ maxHeight: 320, overflow: 'scroll' }}>
          <PlayerList />
        </div>
        <Divider />
        <Typography variant="h5" component="h2" className={classes.title}>
          {canStartRound ? (
            <b>
              {crushCount}&nbsp;crushes｜{wingmanCount}&nbsp;
              {wingmanCount === 1 ? 'wingman' : 'wingmen'}
            </b>
          ) : (
            <i>
              {_.flow(
                playersNeeded =>
                  `Waiting for ${playersNeeded} more player${
                    playersNeeded === 1 ? '' : 's'
                  }...`
              )(PLAYER_COUNT_MIN - participatingPlayerCount)}
            </i>
          )}
        </Typography>
      </CardContent>
      {canStartRound &&
        (isPartyLeader ? (
          <CardActions>
            <Button
              variant="contained"
              color="primary"
              onClick={onClick}
              fullWidth
            >
              Start Series ({participatingPlayerCount}&nbsp;Players)
            </Button>
          </CardActions>
        ) : (
          <div style={{ fontSize: 12, textAlign: 'center' }}>
            <i>
              Waiting for party leader <b>{getPlayer(getPartyLeader()).name}</b>{' '}
              to start the series...
            </i>
          </div>
        ))}
    </Card>
  );
}
