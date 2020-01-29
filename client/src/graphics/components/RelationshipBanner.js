// @flow

import _ from 'lodash';
import React from 'react';

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
    <div>
      <div>You have a crush on {targetPlayer.name}</div>
      <div>
        {targetPlayer.name} needs {needType}
      </div>
    </div>
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
    <div>
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
    </div>
  );
}
