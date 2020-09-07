import React from "react";
import { Button, Header, Segment } from "semantic-ui-react";

import { STATE_FIGHTING } from "../lib/yfighters";
import { useCurrentRound } from "../providers/CurrentRound";
import { useWithdrawPowerAction } from "../hooks/yfightersActions";

function PowerBalance({ powerStaking }) {
  const currentRound = useCurrentRound();
  const withdraw = useWithdrawPowerAction();

  return (
    <div className="PowerBalance">
      <Segment className="PowerBalanceSegment">
        <Header as="h3">POW</Header>
        <p className="PowerBalanceLabel">balance</p>
        <p>{powerStaking.powerBalance}</p>
        <p className="PowerBalanceLabel">locked</p>
        <p>{powerStaking.powerLocked}</p>
        {powerStaking.powerLocked !== "0" ? (
          <Button primary disabled={currentRound && currentRound.state === STATE_FIGHTING} onClick={() => withdraw()}>
            Withdraw
          </Button>
        ) : (
          false
        )}
      </Segment>
    </div>
  );
}

export default PowerBalance;
