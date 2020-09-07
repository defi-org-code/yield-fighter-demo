import React, { useState } from "react";
import { Button, Dropdown, Input, Modal } from "semantic-ui-react";

import TokensJson from "../lib/tokens.json";
import { useBackFighterAction } from "../hooks/yfightersActions";

function BackFighterModal({ initialTokenAddress, powerStaking }) {
  const [amount, setAmount] = useState("0");
  const [tokenAddress, setTokenAddress] = useState(initialTokenAddress);
  const [open, setOpen] = useState(false);
  const back = useBackFighterAction(powerStaking, setOpen);

  const tokenOptions = [];
  for (const [tokenAddress, tokenDetails] of Object.entries(TokensJson)) {
    tokenOptions.push({
      key: tokenAddress.toLowerCase(),
      value: tokenAddress.toLowerCase(),
      text: `${tokenDetails.coin} (${tokenDetails.name})`,
      image: { avatar: true, src: tokenDetails.logo },
    });
  }

  return (
    <Modal
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
      open={open}
      trigger={
        <Button positive disabled={!powerStaking}>
          {initialTokenAddress ? "Vote For" : "Vote New Fighter"}
        </Button>
      }
    >
      <Modal.Header>Vote For Fighter</Modal.Header>
      <Modal.Content>
        <Modal.Description>
          <p>Fighter</p>
          <Dropdown
            placeholder="Select token..."
            fluid
            search
            selection
            options={tokenOptions}
            onChange={(e, data) => setTokenAddress(data.value)}
            defaultValue={initialTokenAddress}
          />
          <br />
          <br />
          <p>Additional deposit</p>
          {powerStaking && powerStaking.powerLocked === "0" && powerStaking.powerBalance === "0" ? (
            <p className="ModalSmall">
              You have no POW tokens available, acquire some and then choose the amount to deposit:
            </p>
          ) : (
            false
          )}
          {powerStaking && powerStaking.powerLocked === "0" && powerStaking.powerBalance !== "0" ? (
            <p className="ModalSmall">How many POW tokens would you like to deposit?</p>
          ) : (
            false
          )}
          {powerStaking && powerStaking.powerLocked !== "0" && powerStaking.powerBalance === "0" ? (
            <p className="ModalSmall">
              You already have {powerStaking && powerStaking.powerLocked} deposited that will be used for voting.
            </p>
          ) : (
            false
          )}
          {powerStaking && powerStaking.powerLocked !== "0" && powerStaking.powerBalance !== "0" ? (
            <p className="ModalSmall">
              You already have {powerStaking && powerStaking.powerLocked} deposited that will be used for voting. You
              also have additional tokens in your balance, how many would you like to deposit in addition?
            </p>
          ) : (
            false
          )}
          {powerStaking && powerStaking.powerLocked !== "0" && powerStaking.powerBalance === "0" ? (
            false
          ) : (
            <Input
              fluid
              onChange={(e, data) => setAmount(data.value)}
              type="number"
              label={{ basic: true, content: "POW" }}
              labelPosition="right"
              placeholder="Enter additional amount..."
              defaultValue={powerStaking && powerStaking.powerBalance}
            />
          )}
        </Modal.Description>
      </Modal.Content>
      <Modal.Actions>
        <Button color="black" onClick={() => setOpen(false)}>
          Cancel
        </Button>
        <Button content="Vote For Fighter" onClick={() => back(tokenAddress, amount)} positive />
      </Modal.Actions>
    </Modal>
  );
}

export default BackFighterModal;
