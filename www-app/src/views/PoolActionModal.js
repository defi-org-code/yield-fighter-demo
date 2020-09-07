import React, { useState } from "react";
import { Button, Input, Modal } from "semantic-ui-react";
import { useWallet } from "use-wallet";

import { usePoolAction } from "../hooks/yfightersActions";

function PoolActionModal({ poolDetails, actionName, actionDescription, actionFunction, withAmount, max, coin }) {
  const [amount, setAmount] = useState("0");
  const [open, setOpen] = useState(false);
  const { account } = useWallet();
  const send = usePoolAction(actionFunction, poolDetails, setOpen);

  return (
    <Modal
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
      open={open}
      trigger={
        <Button disabled={!account} primary>
          {actionName}
        </Button>
      }
    >
      <Modal.Header>{actionName}</Modal.Header>
      <Modal.Content>
        <Modal.Description>
          <p>{actionDescription}</p>
          {withAmount ? (
            <Input
              fluid
              onChange={(e, data) => setAmount(data.value)}
              type="number"
              label={{ basic: true, content: coin + "/POW BPT" }}
              labelPosition="right"
              placeholder="Enter amount..."
              defaultValue={max}
            />
          ) : (
            false
          )}
        </Modal.Description>
      </Modal.Content>
      <Modal.Actions>
        <Button color="black" onClick={() => setOpen(false)}>
          Cancel
        </Button>
        <Button content={actionName} onClick={() => send(amount)} positive />
      </Modal.Actions>
    </Modal>
  );
}

export default PoolActionModal;
