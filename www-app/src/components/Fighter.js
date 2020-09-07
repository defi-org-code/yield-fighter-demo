import ReactAnime from "react-animejs";
import React, { useEffect, useState } from "react";
import { Header, Image } from "semantic-ui-react";

import BackFighterModal from "../views/BackFighterModal";
import TokensJson from "../lib/tokens.json";
import crown from "../img/crown.png";

const { Anime } = ReactAnime;

function Fighter({ style, fighter, canBack, index, totalFighters, leader, powerStaking, fighterGroupId, noBlinking }) {
  const [randoms, setRandoms] = useState({
    horizontal: 0,
    vertical: 0,
    tokenBased: parseInt(fighter.token.slice(-8), 16),
  });

  useEffect(() => {
    setRandoms({
      horizontal: Math.random() * 6 - 3,
      vertical: Math.random() * 5 - 1,
      tokenBased: parseInt(fighter.token.slice(-8), 16),
    });
  }, [fighter.token, index, totalFighters, setRandoms]);

  const horizontalPercent = Math.round(((index + 1) / (totalFighters + 1)) * 100 + randoms.horizontal);
  const verticalPercent = Math.round(10 * randoms.vertical) / 10;
  const flipX = horizontalPercent < 50;
  const tokenJson = TokensJson[fighter.token.toLowerCase()];
  let powerBarPercent = 0;
  if (parseFloat(leader.totalPower) > 0)
    powerBarPercent = Math.round(((10 * parseFloat(fighter.totalPower)) / parseFloat(leader.totalPower)) * 90) / 10;
  if (powerBarPercent < 3) powerBarPercent = 3;
  let hueDegrees = 0;
  if (!tokenJson || tokenJson.fighter === "generic") {
    hueDegrees = Math.round((randoms.tokenBased * 3) % 360);
  }

  return (
    <div
      className="Fighter"
      style={{
        left: horizontalPercent + "vw",
        bottom: verticalPercent + "vh",
        ...style,
      }}
    >
      <Anime
        className={`Anime-${fighterGroupId}`}
        key={`Anime-${fighterGroupId}`}
        animeConfig={{
          loop: true,
          autoplay: !noBlinking,
        }}
        initial={[
          {
            targets: `.Anime-${fighterGroupId} > .Blinking1`,
            opacity: 0,
            easing: "linear",
            duration: 200,
            delay: 1500,
          },
          {
            targets: `.Anime-${fighterGroupId} > .Blinking2`,
            opacity: 1,
            easing: "linear",
            duration: 200,
          },
          {
            targets: `.Anime-${fighterGroupId} > .Blinking2`,
            opacity: 0,
            easing: "linear",
            duration: 200,
            delay: 1500,
          },
          {
            targets: `.Anime-${fighterGroupId} > .Blinking1`,
            opacity: 1,
            easing: "linear",
            duration: 200,
          },
        ]}
      >
        <div className="Blinking1">
          <Header as="h1" className="WhiteOutline">
            <Image circular src={tokenJson ? tokenJson.logo : false} />
            {tokenJson ? tokenJson.coin : "Unknown"}
          </Header>
          <div className="PowerBar">
            <span style={{ width: powerBarPercent + "%" }} />
          </div>
        </div>
        <div className="Blinking2" style={{ opacity: 0 }}>
          {canBack ? <BackFighterModal initialTokenAddress={fighter.token} powerStaking={powerStaking} /> : false}
          <div className="PowerBar">
            <span style={{ width: powerBarPercent + "%" }} />
          </div>
          <div className="PowerBarAmount">
            <span>{fighter.totalPower + " POW"}</span>
          </div>
        </div>
      </Anime>

      {index === 0 && parseFloat(leader.totalPower) > 0 ? (
        <img className="FighterCrown" src={crown} alt="leader" />
      ) : (
        false
      )}
      <object
        className="FighterSvg"
        style={{
          transform: flipX ? "translateX(-50%) scaleX(-1)" : "translateX(-50%)",
          filter: `hue-rotate(${hueDegrees}deg)`,
        }}
        type="image/svg+xml"
        data={process.env.PUBLIC_URL + "/fighters/side.svg"}
      >
        Your browser does not support SVG
      </object>
    </div>
  );
}

export default Fighter;
