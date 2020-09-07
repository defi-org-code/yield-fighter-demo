import { useEffect, useState } from "react";
import { useWallet } from "use-wallet";

import { useTransactionTracker } from "../providers/TransactionTracker";
import { useYfighters } from "../providers/YieldFighters";

function usePowerStaking(interval = 10000) {
  const [powerStaking, setPowerStaking] = useState();
  const { account } = useWallet();
  const yfighters = useYfighters();
  const { numWaiting } = useTransactionTracker();

  useEffect(() => {
    let isMounted = true;
    if (!account || !yfighters) return;
    const fetch = async (account) => {
      const powerStaking = await yfighters.fetchPowerStaking(account);
      if (isMounted) setPowerStaking(powerStaking);
    };
    fetch(account);
    const refreshInterval = setInterval(() => fetch(account), interval);
    return () => {
      clearInterval(refreshInterval);
      isMounted = false;
    };
  }, [interval, account, setPowerStaking, yfighters, numWaiting]);

  return powerStaking;
}

export default usePowerStaking;
