import React, { useState } from "react";
import { Button, Input, Modal } from "semantic-ui-react";
import { useWallet } from "use-wallet";

import TokensJson from "../lib/tokens.json";
import { ZERO_ADDRESS } from "../lib/yfighters";
import { useLaunchPoolAction } from "../hooks/yfightersActions";

function LaunchPoolModal({ winnerTokenAddress }) {
  const [poolTokenAddress, setPoolTokenAddress] = useState(ZERO_ADDRESS);
  const [open, setOpen] = useState(false);
  const { account } = useWallet();
  const launch = useLaunchPoolAction(setOpen);

  const hasWinner = winnerTokenAddress !== ZERO_ADDRESS;
  const actionText = hasWinner ? "Launch Pool" : "Start Next Round";
  const winnerToken = TokensJson[winnerTokenAddress.toLowerCase()];

  return (
    <Modal
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
      open={open}
      trigger={
        <Button primary disabled={!account}>
          {actionText}
        </Button>
      }
    >
      <Modal.Header>{actionText}</Modal.Header>
      <Modal.Content>
        <Modal.Description>
          {hasWinner ? (
            <div>
              <p>
                To launch the pool, please provide the Balancer Pool Token address for{" "}
                {winnerToken ? (
                  <a
                    href={"https://etherscan.io/address/" + winnerTokenAddress}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {winnerToken.coin}
                  </a>
                ) : (
                  false
                )}
                98/POW2:
              </p>
              <Input
                fluid
                onChange={(e, data) => setPoolTokenAddress(data.value)}
                type="text"
                placeholder="Enter BPT address..."
                spellcheck="false"
              />
            </div>
          ) : (
            <p>Start the next round of fighting after cooldown?</p>
          )}
        </Modal.Description>
      </Modal.Content>
      <Modal.Actions>
        <Button color="black" onClick={() => setOpen(false)}>
          Cancel
        </Button>
        <Button content={actionText} onClick={() => launch(poolTokenAddress)} positive />
      </Modal.Actions>
    </Modal>
  );
}

export default LaunchPoolModal;
