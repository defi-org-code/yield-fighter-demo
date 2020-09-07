import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

import { useYfighters } from "./YieldFighters";

const Context = createContext({
  transactions: {},
  trackTransaction: undefined,
  numWaiting: 0,
  numPending: 0,
  numConfirming: 0,
});

function TransactionTrackerProvider({ children }) {
  const yfighters = useYfighters();
  const [state, setState] = useState({});

  const handleTrackTransaction = useCallback(
    (txHashes) => {
      if (!Array.isArray(txHashes)) txHashes = [txHashes];
      let hadChanges = false;
      let newState = state;
      for (const txHash of txHashes) {
        if (state[txHash]) continue;
        newState = {
          ...newState,
          [txHash]: "pending",
        };
        hadChanges = true;
      }
      if (hadChanges) setState(newState);
    },
    [state, setState]
  );

  useEffect(() => {
    if (!yfighters) return;
    const fetchWaiting = async () => {
      let hadChanges = false;
      let newState = state;
      for (const [txHash, txStatus] of Object.entries(state)) {
        if (txStatus !== "pending" && txStatus !== "confirming") continue;
        const newStatus = await yfighters.fetchTransactionStatus(txHash);
        if (newStatus !== txStatus) {
          newState = {
            ...newState,
            [txHash]: newStatus,
          };
          hadChanges = true;
        }
      }
      if (hadChanges) setState(newState);
    };
    const refreshInterval = setInterval(() => fetchWaiting(), 5000);
    return () => clearInterval(refreshInterval);
  }, [state, setState, yfighters]);

  const countWaiting = (state) => {
    let numPending = 0;
    let numConfirming = 0;
    for (const [, txStatus] of Object.entries(state)) {
      if (txStatus === "pending") numPending++;
      if (txStatus === "confirming") numConfirming++;
    }
    return { numPending, numConfirming };
  };

  const { numPending, numConfirming } = countWaiting(state);
  return (
    <Context.Provider
      value={{
        transactions: state,
        numWaiting: numPending + numConfirming,
        numPending,
        numConfirming,
        trackTransaction: handleTrackTransaction,
      }}
    >
      {children}
    </Context.Provider>
  );
}

export function useTransactionTracker() {
  return useContext(Context);
}

export default TransactionTrackerProvider;
