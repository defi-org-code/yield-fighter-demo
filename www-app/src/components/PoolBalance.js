import React from "react";
import { Container, Grid, Header, Image, Popup, Segment } from "semantic-ui-react";
import { useWallet } from "use-wallet";

import CountdownToStaking from "./CountdownToStaking";
import PoolActionModal from "../views/PoolActionModal";
import TokensJson from "../lib/tokens.json";
import usePoolBalance from "../hooks/usePoolBalance";
import { ZERO_ADDRESS } from "../lib/yfighters";

function PoolBalance({ poolDetails }) {
  const { account } = useWallet();
  const state = usePoolBalance(poolDetails);

  if (poolDetails.winnerTokenAddress === ZERO_ADDRESS)
    return (
      <Segment className="PoolSegment" placeholder>
        <p>No winner in this round</p>
        <p>Farming is skipped</p>
      </Segment>
    );

  if (!poolDetails.poolStarted)
    return (
      <Segment className="PoolSegment" placeholder>
        <p>Pool not launched yet</p>
      </Segment>
    );

  if (poolDetails.poolStarted && poolDetails.poolAddress === ZERO_ADDRESS)
    return (
      <Segment className="PoolSegment" placeholder>
        <p>Pool did not launch in time</p>
        <p>Farming is skipped</p>
      </Segment>
    );

  const winnerToken = TokensJson[poolDetails.winnerTokenAddress.toLowerCase()];

  return (
    <Container>
      <Grid columns={2} stackable centered>
        <Grid.Column verticalAlign="middle">
          <Segment className="PoolSegment" placeholder>
            <Header as="h1">
              <Image circular src={winnerToken ? winnerToken.logo : false} />
              {winnerToken ? (
                poolDetails.poolTokenDetails.seedTokenAddress === poolDetails.winnerTokenAddress ? (
                  winnerToken.coin
                ) : (
                  <span>
                    {winnerToken.coin + "/POW "}
                    <Popup trigger={<span>BPT</span>} content="Balancer Pool Token" size="mini" inverted />
                  </span>
                )
              ) : (
                "Unknown"
              )}
            </Header>
            <p className="PoolToken">
              {poolDetails.poolTokenDetails.seedTokenAddress === poolDetails.winnerTokenAddress ? (
                <a
                  href={"https://etherscan.io/address/" + poolDetails.poolTokenDetails.seedTokenAddress}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {poolDetails.poolTokenDetails.seedTokenAddress}
                </a>
              ) : (
                <a
                  href={"https://pools.balancer.exchange/#/pool/" + poolDetails.poolTokenDetails.seedTokenAddress}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {poolDetails.poolTokenDetails.seedTokenAddress}
                  <br />
                  {winnerToken ? `Stake ${winnerToken.coin} in Balancer to get ${winnerToken.coin}/POW BPT` : false}
                </a>
              )}
            </p>
            {account && poolDetails.poolStarted ? (
              <p className="PoolAmount">
                <span>{state.seedStaked}</span>
                <br />
                staked
              </p>
            ) : (
              false
            )}
            {account ? <p className="PoolBalance">{state.seedBalance} balance</p> : false}
            <br />
            {poolDetails.poolStarted && poolDetails.poolTokenDetails ? (
              <div className="PoolButtons">
                <CountdownToStaking targetTime={poolDetails.poolStartTime}>
                  <PoolActionModal
                    poolDetails={poolDetails}
                    actionName="&nbsp;Stake&nbsp;"
                    actionFunction="sendPoolApproveAndStake"
                    actionDescription="How many tokens would you like to stake?"
                    withAmount={true}
                    max={state.seedBalance}
                    coin={winnerToken ? winnerToken.coin : "coins"}
                  />
                  <span style={{ margin: 4 }} />
                  <PoolActionModal
                    poolDetails={poolDetails}
                    actionName="Unstake"
                    actionFunction="sendPoolUnstake"
                    actionDescription="How many tokens would you like to unstake?"
                    withAmount={true}
                    max={state.seedStaked}
                    coin={winnerToken ? winnerToken.coin : "coins"}
                  />
                </CountdownToStaking>
              </div>
            ) : (
              false
            )}
            <div className="PoolVerb">DEPOSIT</div>
          </Segment>
        </Grid.Column>
        <Grid.Column verticalAlign="middle">
          <Segment className="PoolSegment" placeholder>
            <Header as="h1">
              <Image circular src={process.env.PUBLIC_URL + "/token-logo.png"} />
              POW
            </Header>
            <p className="PoolToken">
              <a
                href={"https://etherscan.io/address/" + poolDetails.poolTokenDetails.harvestTokenAddress}
                target="_blank"
                rel="noopener noreferrer"
              >
                {poolDetails.poolTokenDetails.harvestTokenAddress}
              </a>
            </p>
            {account && poolDetails.poolStarted ? (
              <p className="PoolAmount">
                <span>{state.harvestEarned}</span>
                <br />
                earned
              </p>
            ) : (
              false
            )}
            {account ? <p className="PoolBalance">{state.harvestBalance} balance</p> : false}
            <br />
            {poolDetails.poolStarted && poolDetails.poolTokenDetails ? (
              <div className="PoolButtons">
                <PoolActionModal
                  poolDetails={poolDetails}
                  actionName="Harvest"
                  actionFunction="sendPoolWithdraw"
                  actionDescription="Are you sure you want to withdraw all earnings?"
                  withAmount={false}
                />
              </div>
            ) : (
              false
            )}
            <div className="PoolVerb">EARN</div>
          </Segment>
        </Grid.Column>
      </Grid>
      {poolDetails.poolStarted && poolDetails.poolTokenDetails ? (
        <div>
          <br />
          <PoolActionModal
            poolDetails={poolDetails}
            actionName="Exit"
            actionFunction="sendPoolUnstakeAllAndWithdraw"
            actionDescription="Are you sure you want to unstake everything and withdraw all earnings?"
            withAmount={false}
          />
        </div>
      ) : (
        false
      )}
    </Container>
  );
}

export default PoolBalance;
