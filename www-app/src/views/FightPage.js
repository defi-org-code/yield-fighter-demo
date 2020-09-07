import "./FightPage.css";

import React from "react";
import { Button, Header, Loader, Segment } from "semantic-ui-react";
import { Link } from "react-router-dom";

import BackFighterModal from "./BackFighterModal";
import Fighter from "../components/Fighter";
import PageWrapper from "../components/PageWrapper";
import PowerBalance from "../components/PowerBalance";
import RoundCountdownTimer from "../components/RoundCountdownTimer";
import TopFighters from "../components/TopFighters";
import usePowerStaking from "../hooks/usePowerStaking";
import { STATE_FARMING, STATE_FIGHTING, ZERO_ADDRESS } from "../lib/yfighters";
import { useCurrentRound } from "../providers/CurrentRound";

function FightPage() {
  const currentRound = useCurrentRound();
  const powerStaking = usePowerStaking();

  let content;
  if (!currentRound) {
    content = <Loader active inline="centered" />;
  } else if (currentRound.state === STATE_FIGHTING) {
    content = <FightingOngoingContent powerStaking={powerStaking} />;
  } else {
    content = <FightingFinishedContent />;
  }

  return (
    <PageWrapper>
      <div className="RoundAndTimer">
        <Header as="h1" className="BlackOutlineThick">
          Round {(currentRound && currentRound.roundCount) || 0}
        </Header>
        {currentRound && currentRound.state === STATE_FIGHTING ? (
          <RoundCountdownTimer showZero targetTime={currentRound.fightingEndTimestamp} />
        ) : (
          <p className="FightFinished">FIGHT FINISHED</p>
        )}
        {currentRound && currentRound.state === STATE_FARMING ? (
          <div>
            <p className="NextFight">NEXT FIGHT IN</p>
            <RoundCountdownTimer showZero targetTime={currentRound.farmingEndTimestamp} />
          </div>
        ) : (
          false
        )}
      </div>
      <div className="FightBody">{content}</div>
      {powerStaking ? <PowerBalance powerStaking={powerStaking} /> : false}
    </PageWrapper>
  );
}

function FightingOngoingContent({ powerStaking }) {
  return (
    <div className="FightOngoing">
      <TopFighters powerStaking={powerStaking} />
      <div className="StakeNewFighter">
        <BackFighterModal powerStaking={powerStaking} />
      </div>
    </div>
  );
}

function FightingFinishedContent() {
  const currentRound = useCurrentRound();
  const haveWinner = currentRound.leadingToken !== ZERO_ADDRESS;
  const fighter = { token: currentRound.leadingToken, totalPower: "1000" };

  return (
    <div>
      {haveWinner ? (
        <Fighter
          style={{ bottom: "5vh" }}
          fighter={fighter}
          index={0}
          totalFighters={2}
          leader={fighter}
          fighterGroupId={`podium-${fighter.token}`}
          canBack={false}
          noBlinking
        />
      ) : (
        false
      )}
      <Segment compact className={"FightMessage " + (haveWinner && "HaveWinner")}>
        {haveWinner ? (
          <div>
            <p>
              Bathed in blood, the champion stands
              <br />
              over his defeated opponents.
            </p>
            <p>
              Time to enjoy the spoils of war
              <br />
              and farm for the winner.
            </p>
          </div>
        ) : (
          <div>
            <p>Fighting is finished, but no winner in this round.</p>
            <p>Waiting for the next farming round to end...</p>
          </div>
        )}
        <br />
        <Link to={"/pool/" + currentRound.roundCount}>
          <Button>Go To Farming</Button>
        </Link>
      </Segment>
    </div>
  );
}

export default FightPage;
