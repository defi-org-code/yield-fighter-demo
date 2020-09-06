# Yield Fighter (demo)

*Yield Fighter is a working dApp demo developed by the mentors of the [DeFi.org Accelerator](https://defi.org) during a one week hackathon. The goal was to show off what your project could look like if you participate in the accelerator and let the mentors sprinkle some magic dust on +your+ idea.*

*The project is not 100% ready, but it does contain a fully working economic model, a set of implemented Solidity contracts and a fully implemented web3 frontend. If you're interested in building on top of it - all the code is in this repo. You can also contact accelerator@defi.org and [apply](https://defi.org#apply) as a team to get all the help you need from the accelerator mentors.*

<img src="https://cdn-images-1.medium.com/max/2400/1*ayAWqOla2qJbiNeUhH47KQ.png" />

For the full blog post (with more images) see:

https://medium.com/@defiorg/yield-fighter-where-tokens-compete-to-become-the-next-yield-farm-2b047ddd901d

---

## Setup (on Kovan)

1. Use this code at your own risk.

2. There are 3 main directories for sub-projects:

    * `contracts` - containing Solidity code

    * `www-app` - the web3 dapp (client)

    * `www-landing` - the landing page

    Every main directory has a README file that explains its contents and provides more details for the steps below. The gist of running everything together is:

3. The project is currently configured to run on Kovan (contracts + client).

4. First, deploy the contracts to Kovan:

    * In `contracts` run `npm install`.

    * Edit `contracts/deploy-config.json` for running on Kovan according to `contracts/README.md`. Make sure you have some KETH in the first account of the mnemonic.

    * Run `npm run deploy` to deploy.

    * Notice that the deploy script does not deploy the launch pools (round 0).

5. Second, run the client on Kovan:

    * In `www-app` run `npm install`.

    * Edit `www-app/src/lib/tokens.json` for running on Kovan according to `www-app/README.md`.

    * Notice that `www-app/src/lib/pool0.json` contains details of the launch pools (round 0).

    * Run `npm start` to start the client. It's best to use Metamask with the account `FundsAccount` you've specified in step 4.

6. After one of the 4 mock tokens wins the round, when asked to deploy the pool - quickly provide the address appearing in the bottom of the appropriate balancer mock (eg. `www-app/src/lib/contracts/FighterToken2Balancer.json`). You can know which one of the 4 won according to the token name in `www-app/src/lib/tokens.json`.

7. If you have any difficulties and need assistance, contact the DeFi.org mentors at accelerator@defi.org or https://t.me/defiorg.

---

## TLDR - what is Yield Fighter?!

Yield Fighter is a massive-multiplayer governance game in which token communities compete in street fights for becoming the next yield farm.

Every week a new yield farm pool is launched. The pool's harvest token (namely the token that gets distributed to stakers) is always the Yield Fighter POW token. The pool's seed token (namely the token you stake) alternates and is determined by last week's governance vote. Essentially, any token community can win the vote, making sure their community token becomes the seed token.

The votes are animated as arcade street fights, with the various ERC20 tokens as the fighters. To vote for a token, all you need is a few POW tokens. Whichever fighter token gets the most POWs backing it, becomes the winner for the week and gets to seed the next farm. A vote (a fight) takes 2 days and afterwards farming the pool takes a week. We're then back to fighting in a new round with a new winner, and so forth.

Fight. Farm. Repeat.

Important: The POW token should be assumed to be completely worthless. Nobody should buy it, just farm it.

## The POW token

### Yield farming

August 2020, the month that will forever be remembered as the yield farming mania month, has benefited two types of players - "harvest" and "seed" tokens. The harvest tokens, that grow from the fertile ground of the almighty EVM (YFI, YFii/DFI, YFValue, YFLink, ZZZ, YAM, $BASED, PASTA, HAM, Shrimp, Zombie); but to a greater extent, the system benefits the seed tokens that must be planted. These enjoyed record high on-chain liquidity in DEXes and money markets and experience a demand boom (tokens such as LINK, LEND, SNX, COMP).

When YAM launched, all 8 tokens they selected as seed tokens for their farms got a lot of focus. A similar effect was seen by YFL (that focuses on LINK), and YFValue (that chose all sorts of tokens, BAT, BAL, YFI, etc.).
It seems that one of the most important aspects of any yield farming project is the decision of which tokens to use as seed tokens.

Now, imagine that you could influence the decision of which token is going to seed the next farm. If you're part of a token community, you have incentive to make sure that your community token is chosen. When a whole community rallies and works together to push their token into the next farm, the magic happens.

As you've probably guessed by now, this is exactly what the POW token is used for. It provides the governance for the most important decision in the game - which token gets to seed the next farm.

### Initial launch farms

The initial burst of POW tokens lasts one week and includes several hard-coded launch farms. Each launch farm distributes 50,000 POWs. This is "round 0" and its goal is to provide some initial fair distribution for POW so we can start having real fights.

Once the initial burst ends, we move to the first actual fighting round - round 1. When fighting ends for round 1 (see the big countdown timer in the screenshot above), the winner is selected. The farm for the round winner is automatically deployed by the governance contract and launched. When the farming for round 1 ends, the fighting for round 2 starts.

### An example please, I think I'm lost

Let's assume we're in the middle of the third fight (round 3). The current top contenders are LINK, COMP, VEN and LOOM. They're in the top because POW holders voted for them earlier in this round.

Let's say you're a big believer of Chainlink and hold many LINKs. You want LINK to be the seed for the next farm. You vote with your POW tokens to support LINK in the current round, and give it a huge POWer boost. Let's assume LINK then gets the most votes, and wins the round.

### Round winner farms

If LINK was the winner for round 3, a new farm launches after the fight, accepting BPT:LINK98/POW2 (these are Balancer liquidity tokens).

The new farm distributes 100,000*w POW tokens in one week. The constant w is a measure of participation in the fighting stage - the more POW tokens participate in the vote, the larger w becomes, and the more POW tokens are going to be minted and distributed. The reasoning behind varying w is to incentivize voting.

## The fighting

When farming ends, fighting is renewed once again. Any ERC20 token can become a new fighter (with the exception of the last few round winners - we want to introduce new blood and prevent one community from hogging POW). Fighting lasts 54 hours.

To vote, a user locks their POW tokens in the governance contract and states which token they're voting for. The lockup lasts until the end of the voting period (so that no one can vote twice). The weight of each vote is proportional to the amount of POW tokens that were locked and to the time left for the vote. This means that if you vote at the very beginning of the round, your vote counts more. The reasoning behind this is to incentivize early voting and avoid people waiting for the last minute.

When the fighting time is over, the governance contract calculates the winner and automatically launches the farm for the coming farming period. After farming, fighting will repeat, and so on.

## Some sweet sweet extras

### Fighter characters

Part of the magic dust in this dApp is the great effort put in the app itself - it's clear, easy to use, and f…king beautiful. Since crypto communities are meme engines, we also let each community design their own character to represent its project in the app. A fighter is just a bunch of images for the different body parts.

### Whitelist

Since there are many weird ERC20s out there that do unexpected things, we need to restrict the tokens that can participate. We have created an initial list with ~150 tokens that seem active and with a reasonable holder base according to etherscan. Only these projects can participate as of now as the list is hard-coded in the whitelist contract. If there's a new token that wants to be added, it can be added to the whitelist list via a transaction. This is the only admin permission in the system (adding contenders to the 150+ list).

### Audits

The contracts have not been fully audited yet. Use at your own risk. No seriously, something CAN go wrong, and funds CAN be lost. Please! review the code before using and only if you feel comfortable jump in. We did clone the contracts from previous projects like the YAM pool contract and have not touched critical code that handles funds (other than valueless POW tokens).

### Testing on Kovan

This repo contains a fully working demo that can easily be deployed to Kovan. The Kovan example contains 4 mock fighter tokens (each having their own BPT token mock for testing the integration with Balancer). The client is also there and will let you fool around with Metamask. All the round times have been shortened to a few minutes, but this is just a parameter in the constructors and can easily be extended in the real thing.

---

If anyone wants to bring this idea to life and finish the remaining work to create a real project out of it - you're welcome to at your own risk. If you apply to the accelerator you will also get lots of help from our mentors and other cool benefits you can check out on defi.org.

You can also apply with your own idea or partially completed work, our mentors will help you bring it to the same level of polish.

<img src="https://cdn-images-1.medium.com/max/1600/1*NDpj4bAeY6wHJdVTFkSAiQ.gif" />