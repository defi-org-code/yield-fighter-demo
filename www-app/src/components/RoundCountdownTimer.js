import React from "react";
import Countdown, { zeroPad } from "react-countdown";

function RoundCountdownTimer({ targetTime, showZero }) {
  const targetDate = new Date(targetTime * 1000);
  if (!showZero && new Date() > targetDate) return false;

  const renderer = ({ days, hours, minutes, seconds }) => (
    <span>
      {days > 0 ? zeroPad(days) + ":" : false}
      {hours > 0 ? zeroPad(hours) + ":" : false}
      {zeroPad(minutes)}:{zeroPad(seconds)}
    </span>
  );

  return (
    <div className="RoundCountdownTimer">
      <Countdown renderer={renderer} date={targetDate} />
    </div>
  );
}

export default RoundCountdownTimer;
