import React from "react";
import Countdown, { zeroPad } from "react-countdown";
import { Button } from "semantic-ui-react";
import { useWallet } from "use-wallet";

function CountdownToStaking({ children, targetTime }) {
  const { account } = useWallet();
  const targetDate = new Date(targetTime * 1000);

  const renderer = ({ days, hours, minutes, seconds, completed }) => {
    if (completed) return children;
    return (
      <Button style={{ maxWidth: "100%" }} primary disabled={!account}>
        Staking opens in {days > 0 ? zeroPad(days) + ":" : false}
        {hours > 0 ? zeroPad(hours) + ":" : false}
        {zeroPad(minutes)}:{zeroPad(seconds)}
      </Button>
    );
  };

  return <Countdown renderer={renderer} date={targetDate} />;
}

export default CountdownToStaking;
