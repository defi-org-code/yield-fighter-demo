import "./App.css";

import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { UseWalletProvider } from "use-wallet";

import CurrentRoundProvider from "./providers/CurrentRound";
import FightPage from "./views/FightPage";
import HomePage from "./views/HomePage";
import PoolPage from "./views/PoolPage";
import TransactionTrackerProvider from "./providers/TransactionTracker";
import YieldFightersProvider from "./providers/YieldFighters";
import config from "./config.json";

function Providers({ children }) {
  return (
    <UseWalletProvider chainId={config.network}>
      <YieldFightersProvider>
        <TransactionTrackerProvider>
          <CurrentRoundProvider>{children}</CurrentRoundProvider>
        </TransactionTrackerProvider>
      </YieldFightersProvider>
    </UseWalletProvider>
  );
}

function App() {
  return (
    <Providers>
      <BrowserRouter>
        <Switch>
          <Route path="/" exact>
            <FightPage />
          </Route>
          <Route path="/pool/:poolName">
            <PoolPage />
          </Route>
          <Route path="/home">
            <HomePage />
          </Route>
        </Switch>
      </BrowserRouter>
    </Providers>
  );
}

export default App;
