import React from "react";

import Fighter from "../components/Fighter";
import useTopFighters from "../hooks/useTopFighters";
import { useCurrentRound } from "../providers/CurrentRound";

function TopFighters({ powerStaking }) {
  const currentRound = useCurrentRound();
  const topFighters = useTopFighters(currentRound);

  return (
    <div className="TopFighters">
      {topFighters.topFightersList.map((fighter, index) => (
        <Fighter
          fighter={fighter}
          index={index}
          totalFighters={topFighters.topFightersList.length}
          leader={topFighters.topFightersList[0]}
          fighterGroupId={`${topFighters.responseTimestamp}-${fighter.token}`}
          canBack={
            !powerStaking ||
            !currentRound ||
            powerStaking.backedAtRound !== currentRound.roundCount ||
            powerStaking.tokenBacked === fighter.token
          }
          powerStaking={powerStaking}
        />
      ))}
    </div>
  );
}

export default TopFighters;
