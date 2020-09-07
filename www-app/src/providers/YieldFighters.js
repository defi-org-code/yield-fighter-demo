import React, { createContext, useContext, useEffect, useState } from "react";
import { useWallet } from "use-wallet";

import config from "../config.json";
import { YieldFighters } from "../lib/yfighters";

const Context = createContext({ yfighters: undefined });

function YieldFightersProvider({ children }) {
  const { ethereum, account } = useWallet();
  const [instance, setInstance] = useState();
  const provider = ethereum || global.ethereum;

  useEffect(() => {
    if (provider) {
      const lib = new YieldFighters(provider, config.network, {
        defaultAccount: "",
        defaultConfirmations: 1,
        autoGasMultiplier: 1.5,
        defaultGas: "6000000",
        defaultGasPrice: "1000000000000",
        accounts: [],
        ethereumNodeTimeout: 10000,
      });
      setInstance(lib);
    }
  }, [provider]);

  useEffect(() => {
    if (instance && account) instance.setDefaultAccount(account);
  }, [instance, account]);

  return <Context.Provider value={{ yfighters: instance }}>{children}</Context.Provider>;
}

export function useYfighters() {
  const { yfighters } = useContext(Context);
  return yfighters;
}

export default YieldFightersProvider;
