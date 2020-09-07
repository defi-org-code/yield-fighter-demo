import { useEffect, useState } from "react";

import { useYfighters } from "../providers/YieldFighters";

function usePoolDetails(roundNumber, currentRound, subPoolName) {
  const [poolDetails, setPoolDetails] = useState();
  const yfighters = useYfighters();

  useEffect(() => {
    let isMounted = true;
    if (!yfighters || !currentRound || roundNumber === -1) return;
    const fetch = async () => {
      const poolDetails = await yfighters.fetchPoolDetails(roundNumber, currentRound, subPoolName);
      if (isMounted) setPoolDetails(poolDetails);
    };
    fetch();
    return () => (isMounted = false);
  }, [yfighters, setPoolDetails, roundNumber, currentRound, subPoolName]);

  return poolDetails;
}

export default usePoolDetails;
