import { useEffect, useState } from "react";
import { useWallet } from "use-wallet";

import { useTransactionTracker } from "../providers/TransactionTracker";
import { useYfighters } from "../providers/YieldFighters";

function usePoolBalance(poolDetails, interval = 10000) {
  const [state, setState] = useState({
    seedStaked: "",
    seedBalance: "",
    harvestEarned: "",
    harvestBalance: "",
  });
  const { account } = useWallet();
  const yfighters = useYfighters();
  const { numWaiting } = useTransactionTracker();

  useEffect(() => {
    let isMounted = true;
    if (!account || !yfighters || !poolDetails || !poolDetails.poolTokenDetails) return;
    const fetch = async (account) => {
      const tokenBalances = await yfighters.fetchTokenBalances(account, poolDetails.poolTokenDetails);
      const poolBalances = poolDetails.poolStarted ? await yfighters.fetchPoolBalances(account, poolDetails) : false;
      if (isMounted)
        setState({
          ...tokenBalances,
          ...poolBalances,
        });
    };
    fetch(account);
    const refreshInterval = setInterval(() => fetch(account), interval);
    return () => {
      clearInterval(refreshInterval);
      isMounted = false;
    };
  }, [interval, account, setState, yfighters, poolDetails, numWaiting]);

  return state;
}

export default usePoolBalance;
