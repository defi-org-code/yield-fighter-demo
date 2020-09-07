import "./HomePage.css";

import React from "react";
import ReactAnime from "react-animejs";

import PageWrapper from "../components/PageWrapper";
import logo from "../img/logo.svg";

const { Anime } = ReactAnime;

function HomePage() {
  return (
    <PageWrapper>
      <img src={logo} className="HomePage-logo" alt="logo" />
      <p id="subtitle">FIGHT. FARM. REPEAT.</p>
      <Anime initial={[{ targets: "#insert-coin", opacity: 0, delay: 1000, loop: true }]}>
        <p id="insert-coin" style={{ marginTop: "8vmin" }}>
          INSERT COIN
        </p>
      </Anime>
    </PageWrapper>
  );
}

export default HomePage;
