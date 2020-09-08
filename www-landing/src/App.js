import React from 'react';
import logo from './logo.svg';
import githubButton from './github.svg';
import telegramButton from './telegram.svg';
import defiOrgButton from './defiorg.svg';
import mediumButton from './medium.svg';
import './App.css';
import ReactAnime from 'react-animejs';
import yamBottom from './yam-bottom.png';
import yamFace from './yam-face.png';
import yamExtra from './yam-extra.png';
import linkBottom from './link-bottom.png';
import linkFace from './link-face.png';
import linkExtra from './link-extra.png';
const { Anime } = ReactAnime;

function App() {
  return (
    <div>
      <Anime
        animeConfig={{
          loop: true
        }}
        initial={[
          {
            targets: ".App2",
            opacity: 1,
            easing: "linear",
            delay: 6000,
            duration: 200
          },
          {
            targets: "#token1",
            backgroundColor: [ "#FF8282" ],
            easing: "linear",
            duration: 100
          },
          {
            targets: "#token7",
            backgroundColor: [ "#5DC4FF" ],
            easing: "linear",
            duration: 100
          },
          {
            targets: "#token1",
            backgroundColor: [ "#e0e0e0" ],
            easing: "linear",
            duration: 100,
            delay: 800
          },
          {
            targets: "#token5",
            backgroundColor: [ "#FF8282" ],
            easing: "linear",
            duration: 100
          },
          {
            targets: "#token7",
            backgroundColor: [ "#e0e0e0" ],
            easing: "linear",
            duration: 100,
            delay: 400
          },
          {
            targets: "#token4",
            backgroundColor: [ "#5DC4FF" ],
            easing: "linear",
            duration: 100
          },
          {
            targets: "#token5",
            backgroundColor: [ "#e0e0e0" ],
            easing: "linear",
            duration: 100,
            delay: 400
          },
          {
            targets: "#token2",
            backgroundColor: [ "#FF8282" ],
            easing: "linear",
            duration: 100
          },
          {
            targets: "#token4",
            backgroundColor: [ "#e0e0e0" ],
            easing: "linear",
            duration: 100,
            delay: 400
          },
          {
            targets: "#token3",
            backgroundColor: [ "#5DC4FF" ],
            easing: "linear",
            duration: 100
          },
          {
            targets: "#token2",
            backgroundColor: [ "#e0e0e0", "#FF8282", "#e0e0e0", "#FF8282" ],
            easing: "linear",
            duration: 200,
            delay: 500
          },
          {
            targets: "#token3",
            backgroundColor: [ "#e0e0e0", "#5DC4FF", "#e0e0e0", "#5DC4FF" ],
            easing: "linear",
            duration: 200,
            delay: 500
          },
          {
            targets: ".App3",
            opacity: 1,
            delay: 1200,
            easing: "linear",
            duration: 200
          },
          {
            targets: ".App3-spacing",
            width: "18vw"
          },
          {
            targets: ".App2",
            opacity: 0,
            delay: 4000,
            duration: 0,
          },
          {
            targets: ".App3",
            opacity: 0,
            delay: 0,
            easing: "linear",
            duration: 200
          }
        ]}
      >

      <div className="App">
        <Anime initial={[{ targets: "#insert-coin", opacity: 0, delay: 1000, loop: true }] }>
          <header className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <p id="subtitle">FIGHT. FARM. REPEAT.</p>
            <p id="insert-coin" className="hello" style={{marginTop: "8vmin"}}>INSERT COIN</p>
          </header>
        </Anime>
      </div>

      <div className="App2" style={{opacity: 0}}>
        <header className="App2-header">
          <p style={{marginBottom: "8vmin"}}>FIGHTER SELECT</p>
          <div className="FighterRow">
            <div id="token1" className="Select">
              <img src="https://assets.coingecko.com/coins/images/677/large/basic-attention-token.png?1547034427" />
            </div>            
            <div id="token2" className="Select">
              <img src="https://assets.coingecko.com/coins/images/12106/large/YAM.png?1597175648" />
            </div>
            <div id="token3" className="Select">
              <img src="https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png?1547034700" />
            </div>            
            <div id="token4" className="Select">
              <img src="https://assets.coingecko.com/coins/images/12115/large/Based.png?1597261198" />
            </div>
          </div>
          <div className="FighterRow">
            <div id="token5" className="Select">
              <img src="https://assets.coingecko.com/coins/images/11849/large/yfi-192x192.png?1598325330" />
            </div>            
            <div id="token6" className="Select">
              <img src="https://assets.coingecko.com/coins/images/10775/large/COMP.png?1592625425" />
            </div>
            <div id="token7" className="Select">
              <img src="https://assets.coingecko.com/coins/images/1364/large/Mark_Maker.png?1585191826" />
            </div>
          </div>
        </header>
      </div>

      <div className="App3" style={{opacity: 0}}>
        <Anime initial={[{ targets: ".move-up-down", translateY: 10, duration: 1500, loop: true, easing: "easeInOutSine", direction: 'alternate' }] }>
          <header className="App3-header">
            <div>
              <img src={yamBottom} style={{ width: "100%" }} />
              <img src={yamFace} className="move-up-down" style={{ position: "absolute", width: "calc(100% * 0.657)", left: "calc(100% * 0.17)", bottom: "calc(100% * 0.38)" }} />
              <img src={yamExtra} style={{ position: "absolute", width: "calc(100% * 0.47)", left: "calc(100% * -0.05)", bottom: "calc(100% * 0.23)" }} />
              <p style={{ color: "#FF3B3B", position: "absolute", width: "100%", bottom: "calc(100% * 0.04)" }}>YAM</p>
            </div>
            <div className="App3-spacing" style={{width: "100vw"}} />
            <div>
              <img src={linkBottom} style={{ width: "100%" }} />
              <img src={linkExtra} style={{ position: "absolute", width: "calc(100% * 0.393)", left: "calc(100% * 0.6)", bottom: "calc(100% * 0.7)" }} />
              <img src={linkFace} className="move-up-down" style={{ position: "absolute", width: "calc(100% * 0.904)", left: "calc(100% * -0.05)", bottom: "calc(100% * 0.20)" }} />
              <img src={linkBottom} style={{ position: "absolute", width: "100%", left: 0, bottom: 0 }} />
              <p style={{ color: "#019EFF", position: "absolute", width: "100%", bottom: "calc(100% * 0.04)" }}>LINK</p>
            </div>
          </header>
        </Anime>
      </div>

      </Anime>

      <div className="ButtonsOverlay">
        <a href="https://github.com/defi-org-code/yield-fighter-demo">
          <img src={githubButton} width="32" height="32" />
        </a>
        <a href="https://t.me/defiorg">
          <img src={telegramButton} width="32" height="32" />
        </a>
        <a href="https://defi.org#yieldfighter">
          <img src={defiOrgButton} width="32" height="32" />
        </a>
        <a href="https://medium.com/@defiorg/yield-fighter-where-tokens-compete-to-become-the-next-yield-farm-2b047ddd901d">
          <img src={mediumButton} width="32" height="32" />
        </a>
      </div>
    </div>
  );
}

export default App;