import { useEffect, useState } from "react";

import { useTransactionTracker } from "../providers/TransactionTracker";
import { useYfighters } from "../providers/YieldFighters";

function useTopFighters(currentRound, interval = 30000) {
  const [topFighters, setTopFighters] = useState({
    topFightersList: [],
    responseTimestamp: 0,
  });
  const yfighters = useYfighters();
  const { numWaiting } = useTransactionTracker();

  const roundNumber = (currentRound && currentRound.roundCount) || 0;
  useEffect(() => {
    let isMounted = true;
    if (!yfighters || roundNumber === 0) return;
    const fetch = async () => {
      const topFightersList = await yfighters.fetchTopFighters(roundNumber);
      if (isMounted) {
        setTopFighters({
          topFightersList,
          responseTimestamp: new Date().getTime(),
        });
      }
    };
    fetch();
    const refreshInterval = setInterval(() => fetch(), interval);
    return () => {
      clearInterval(refreshInterval);
      isMounted = false;
    };
  }, [interval, roundNumber, setTopFighters, yfighters, numWaiting]);

  return topFighters;
}

export default useTopFighters;
