import React from "react";
import { Dimmer, Image, Loader, Segment } from "semantic-ui-react";

import { useTransactionTracker } from "../providers/TransactionTracker";

function WaitingTransactions() {
  const { numPending, numConfirming } = useTransactionTracker();
  let sentence = [];
  if (numPending > 0) sentence.push(`${numPending} pending`);
  if (numConfirming > 0) sentence.push(`${numConfirming} unconfirmed`);

  return (
    <div className="RootWaitingTransactions">
      {sentence.length > 0 ? (
        <Segment>
          <Dimmer active>
            <Loader indeterminate>{sentence.join(", ") + " transactions"}</Loader>
          </Dimmer>
          <Image src="https://react.semantic-ui.com/images/wireframe/short-paragraph.png" />
        </Segment>
      ) : (
        false
      )}
    </div>
  );
}

export default WaitingTransactions;
