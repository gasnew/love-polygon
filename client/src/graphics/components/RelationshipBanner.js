// @flow

import _ from 'lodash';
import React from 'react';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

import NameTag from './NameTag';
import {
  getNeeds,
  getPlayer,
  getPlayerRelationship,
} from '../../state/getters';
import type { Player, Relationship } from '../../state/state';

type RelationshipProps = {
  targetPlayer: Player,
  needType: string,
};

function Crush({ targetPlayer, needType }: RelationshipProps) {
  return (
    <p>
      <Typography>
        You have a{' '}
        <span style={{ fontWeight: 'bold', color: '#FF0000' }}>crush</span> on{' '}
        <NameTag playerId={targetPlayer.id} />
      </Typography>
      <Typography>
        <NameTag playerId={targetPlayer.id} /> needs {needType}
      </Typography>
    </p>
  );
}

function Wingman({ targetPlayer, needType }: RelationshipProps) {
  return (
    <div>
      <div>You are {targetPlayer.name}'s wingman</div>
      <div>
        {targetPlayer.name}'s crush needs {needType}
      </div>
    </div>
  );
}

type Props = {
  relationship: Relationship,
};

export default function RelationshipBanner({ relationship }: Props) {
  const needTypeById = id => _.find(getNeeds(), ['playerId', id]).type;

  const targetPlayer = getPlayer(relationship.toId);

  return (
    <Paper elevation={3} square style={{ padding: 10 }}>
      {relationship.type === 'crush' ? (
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
      )}
    </Paper>
  );
}
