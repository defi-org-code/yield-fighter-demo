import "./PoolPage.css";

import React from "react";
import ReactAnime from "react-animejs";
import { Button, Container, Grid, Header, Image, Loader, Segment } from "semantic-ui-react";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";

import LaunchPoolModal from "./LaunchPoolModal";
import PageWrapper from "../components/PageWrapper";
import PoolBalance from "../components/PoolBalance";
import PrevNextPool from "../components/PrevNextPool";
import usePoolDetails from "../hooks/usePoolDetails";
import { useCurrentRound } from "../providers/CurrentRound";

const { Anime } = ReactAnime;

function PoolPage() {
  let { poolName } = useParams();
  const currentRound = useCurrentRound();
  const roundNumber = poolName === "latest" ? (currentRound && currentRound.roundCount) || -1 : parseInt(poolName);
  const subPoolName = poolName.startsWith("0-") && poolName.substr(2);
  const poolDetails = usePoolDetails(roundNumber, currentRound, subPoolName);

  let content;
  if (!currentRound || !poolDetails || poolDetails.roundNumber !== roundNumber) {
    content = <Loader active inline="centered" />;
  } else if (poolDetails.poolStarted) {
    content = <PoolStartedContent poolDetails={poolDetails} />;
  } else if (poolDetails.poolCanStart) {
    content = <PoolCanStartContent poolDetails={poolDetails} />;
  } else if (poolDetails.subPools) {
    content = <SubPoolsMenuContent poolDetails={poolDetails} />;
  } else {
    content = <UnavailablePoolContent />;
  }

  return (
    <PageWrapper>
      <div className="RoundAndTimer">
        <Header as="h1" className="BlackOutlineThick">
          Round {roundNumber}
        </Header>
        {poolDetails && poolDetails.poolLatest ? <p className="LatestFarm">LATEST FARM</p> : false}
      </div>
      <Container textAlign="center">{content}</Container>
      <br />
      <div className="PrevNextPool">
        <PrevNextPool roundNumber={roundNumber} />
      </div>
    </PageWrapper>
  );
}

function PoolStartedContent({ poolDetails }) {
  return (
    <Container>
      <PoolBalance poolDetails={poolDetails} />
    </Container>
  );
}

function PoolCanStartContent({ poolDetails }) {
  return (
    <div>
      <PoolBalance poolDetails={poolDetails} />
      <Anime initial={[{ targets: ".PoolLaunchButton", opacity: 0, delay: 1000, loop: true }]}>
        <div className="PoolLaunchButton">
          <LaunchPoolModal winnerTokenAddress={poolDetails.winnerTokenAddress} />
        </div>
      </Anime>
    </div>
  );
}

function SubPoolsMenuContent({ poolDetails }) {
  return (
    <Grid columns={3} stackable centered className="SubPoolMenu">
      {Object.keys(poolDetails.subPools).map((subPoolId) => {
        const subPool = poolDetails.subPools[subPoolId];
        return (
          <Grid.Column verticalAlign="middle" key={subPoolId}>
            <Segment>
              <Image circular src={subPool.seedToken.logo} />
              <p>
                deposit {subPool.seedToken.coin}
                <br />
                earn POW
              </p>
              <Link to={`/pool/0-${subPoolId}`}>
                <Button primary>{subPool.name}</Button>
              </Link>
            </Segment>
          </Grid.Column>
        );
      })}
    </Grid>
  );
}

function UnavailablePoolContent() {
  return (
    <Segment basic>
      <p style={{ color: "white" }}>The winner for current round is still undecided.</p>
      <br />
      <Link to="/">
        <Button color="black">Watch The Fight</Button>
      </Link>
    </Segment>
  );
}

export default PoolPage;
