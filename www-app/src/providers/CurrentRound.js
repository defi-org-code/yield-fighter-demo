import React, { createContext, useContext, useEffect, useState } from "react";

import { useTransactionTracker } from "./TransactionTracker";
import { useYfighters } from "./YieldFighters";

const Context = createContext();

function CurrentRoundProvider({ children }) {
  const yfighters = useYfighters();
  const { numWaiting } = useTransactionTracker();
  const [currentRound, setCurrentRound] = useState();

  useEffect(() => {
    if (!yfighters) return;
    let timeout;
    const fetch = async () => {
      const round = await yfighters.fetchCurrentRound();
      console.log("Current Round:", round);
      setCurrentRound(round);
      if (!timeout) {
        const now = new Date().getTime();
        const dueTime = round.fightingEndTimestamp || round.farmingEndTimestamp;
        if (dueTime > 0) timeout = setTimeout(() => fetch(), dueTime * 1000 - now + 2000);
      }
    };
    fetch();
    const refreshInterval = setInterval(() => fetch(), 30000);
    return () => {
      clearInterval(refreshInterval);
      if (timeout) clearTimeout(timeout);
    };
  }, [setCurrentRound, yfighters, numWaiting]);

  return <Context.Provider value={currentRound}>{children}</Context.Provider>;
}

export function useCurrentRound() {
  return useContext(Context);
}

export default CurrentRoundProvider;
