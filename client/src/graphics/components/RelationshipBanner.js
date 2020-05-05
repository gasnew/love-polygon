// @flow

import _ from 'lodash';
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import { getItemImage } from './Item';
import NameTag from './NameTag';
import {
  getNeeds,
  getPlayer,
  getPlayerRelationship,
} from '../../state/getters';
import type { Player, Relationship } from '../../state/state';
import type { TokenType } from '../../../../server/networkTypes';

type RelationshipProps = {
  targetPlayer: Player,
  needType: TokenType,
};

const useStyles = makeStyles(theme => ({
  p: {
    fontFamily: theme.nicefont.fontFamily,
    marginTop: '0.5rem',
    marginBottom: '0.5rem',
  },
  crush: { color: '#FF0000', fontWeight: 'bold' },
}));

function Crush({ targetPlayer, needType }: RelationshipProps) {
  const classes = useStyles();

  return (
    <div>
      <Typography className={classes.p} variant="h5">
        You have a <span className={classes.crush}>crush</span> on{' '}
        <NameTag playerId={targetPlayer.id} />
      </Typography>
      <Typography className={classes.p} variant="h5">
        <NameTag playerId={targetPlayer.id} /> needs{' '}
        <img
          alt="I am a delicious food"
          style={{ position: 'relative', top: '0.4rem', height: '2rem', width: '2rem' }}
          src={getItemImage(needType)}
        />
      </Typography>
    </div>
  );
}

function Wingman({ targetPlayer, needType }: RelationshipProps) {
  const classes = useStyles();

  return (
    <div>
      <Typography className={classes.p} variant="h5">
        You are <NameTag playerId={targetPlayer.id} />
        's wingman
      </Typography>
      <Typography className={classes.p} variant="h5">
        <NameTag playerId={targetPlayer.id} />
        's crush needs{' '}
        <img
          alt="I am a delicious food"
          style={{ position: 'relative', top: '0.4rem', height: '2rem', width: '2rem' }}
          src={getItemImage(needType)}
        />
      </Typography>
    </div>
  );
}

type Props = {
  relationship: Relationship,
};

export default function RelationshipBanner({ relationship }: Props) {
  const needTypeById = id => _.find(getNeeds(), ['playerId', id]).type;

  const targetPlayer = getPlayer(relationship.toId);

  return relationship.type === 'crush' ? (
    <Crush
      targetPlayer={targetPlayer}
      needType={needTypeById(targetPlayer.id)}
    />
  ) : (
    <Wingman
      targetPlayer={targetPlayer}
      needType={needTypeById(
        getPlayer(getPlayerRelationship(targetPlayer.id).toId).id
      )}
    />
  );
}
