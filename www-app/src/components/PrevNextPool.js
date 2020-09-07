import React from "react";
import { Button, Icon, Segment } from "semantic-ui-react";
import { Link } from "react-router-dom";

import { useCurrentRound } from "../providers/CurrentRound";

function PrevNextPool({ roundNumber }) {
  const currentRound = useCurrentRound();
  if (!currentRound) return false;
  const hasPrevButton = roundNumber > 0;
  const hasNextButton = roundNumber < currentRound.roundCount;

  return (
    <Segment basic>
      <Link to={hasPrevButton ? "/pool/" + (roundNumber - 1).toString() : "#"}>
        <Button icon labelPosition="left" disabled={!hasPrevButton}>
          <Icon name="left arrow" />
          Previous Round
        </Button>
      </Link>
      <span style={{ margin: 3 }} />
      <Link to={hasNextButton ? "/pool/" + (roundNumber + 1).toString() : "#"}>
        <Button icon labelPosition="right" disabled={!hasNextButton}>
          Next Round&nbsp;&nbsp;&nbsp;
          <Icon name="right arrow" />
        </Button>
      </Link>
    </Segment>
  );
}

export default PrevNextPool;
