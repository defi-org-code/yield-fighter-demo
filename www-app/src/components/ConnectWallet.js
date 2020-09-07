import React from "react";
import { Button } from "semantic-ui-react";
import { useWallet } from "use-wallet";

function ConnectWallet(props) {
  const { account, connect, reset } = useWallet();

  if (!account) {
    return (
      <Button {...props} primary onClick={() => connect("injected")}>
        Connect Wallet
      </Button>
    );
  } else {
    return (
      <Button {...props} primary onClick={() => reset()}>
        Disconnect Wallet
      </Button>
    );
  }
}

export default ConnectWallet;
