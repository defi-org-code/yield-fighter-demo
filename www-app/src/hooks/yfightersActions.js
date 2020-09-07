import { useCallback } from "react";
import { useWallet } from "use-wallet";

import { useCurrentRound } from "../providers/CurrentRound";
import { useTransactionTracker } from "../providers/TransactionTracker";
import { useYfighters } from "../providers/YieldFighters";

export function useWithdrawPowerAction() {
  const { account } = useWallet();
  const yfighters = useYfighters();
  const { trackTransaction } = useTransactionTracker();

  return useCallback(async () => {
    if (!account || !yfighters) return;
    const txHashes = await yfighters.sendWithdrawPower(account);
    trackTransaction(txHashes);
  }, [account, yfighters, trackTransaction]);
}

export function useBackFighterAction(powerStaking, setOpen) {
  const { account } = useWallet();
  const yfighters = useYfighters();
  const currentRound = useCurrentRound();
  const { trackTransaction } = useTransactionTracker();

  return useCallback(
    async (tokenAddress, amount) => {
      if (!account || !yfighters) return;
      const txHashes = await yfighters.sendBackFighter(account, tokenAddress, amount, powerStaking, currentRound);
      trackTransaction(txHashes);
      setOpen(false);
    },
    [setOpen, account, yfighters, powerStaking, currentRound, trackTransaction]
  );
}

export function usePoolAction(actionFunction, poolDetails, setOpen) {
  const { account } = useWallet();
  const yfighters = useYfighters();
  const { trackTransaction } = useTransactionTracker();

  return useCallback(
    async (amount) => {
      if (!account || !yfighters) return;
      const txHashes = await yfighters[actionFunction](account, poolDetails, amount);
      trackTransaction(txHashes);
      setOpen(false);
    },
    [setOpen, account, yfighters, poolDetails, actionFunction, trackTransaction]
  );
}

export function useLaunchPoolAction(setOpen) {
  const yfighters = useYfighters();
  const { trackTransaction } = useTransactionTracker();

  return useCallback(
    async (poolTokenAddress) => {
      if (!yfighters) return;
      const txHashes = await yfighters.sendLaunchPool(poolTokenAddress);
      trackTransaction(txHashes);
      setOpen(false);
    },
    [setOpen, yfighters, trackTransaction]
  );
}
