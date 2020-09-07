import React from "react";
import { Grid, Menu } from "semantic-ui-react";
import { NavLink, useLocation } from "react-router-dom";

import ConnectWallet from "./ConnectWallet";
import WaitingTransactions from "./WaitingTransactions";

function PageWrapper({ children }) {
  const location = useLocation();
  let pageClass = "PoolPage";
  if (location.pathname === "/") pageClass = "FightPage";
  else if (location.pathname === "/home") pageClass = "HomePage";

  return (
    <div className={"RootPage " + pageClass}>
      <Grid padded className="RootMenu">
        <Grid.Row columns={4}>
          <Grid.Column />
          <Grid.Column>
            <Menu inverted secondary widths="3">
              <NavLink exact to="/home" className="item">
                HOME
              </NavLink>
              <span style={{ margin: 4 }} />
              <NavLink exact to="/" className="item">
                FIGHT
              </NavLink>
              <span style={{ margin: 4 }} />
              <NavLink
                to="/pool/latest"
                className="item"
                isActive={(match, location) => {
                  return location.pathname.startsWith("/pool/");
                }}
              >
                FARM
              </NavLink>
            </Menu>
          </Grid.Column>
          <Grid.Column>
            <ConnectWallet floated="right" />
          </Grid.Column>
        </Grid.Row>
      </Grid>
      <div className="RootBody">{children}</div>
      <WaitingTransactions />
    </div>
  );
}

export default PageWrapper;
