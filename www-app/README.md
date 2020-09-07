# Yield Fighter dApp Frontend

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Notable configuration files

* `www-app/src/lib/tokens.json`

    * The names and logos of the whitelisted candidate tokens. List should match the list in the whitelist contract.
    
    * If working on mainnet, for the full list of ~150 tokens, replace contents with the file `tokens-150.json` in the same directory.

    * If testing on Kovan and deployed a new version of the contracts, edit the file and replace the four addresses with the addresses found in the bottom of:
        * `www-app/src/lib/contracts/WinnerToken.json`
        * `www-app/src/lib/contracts/FighterToken2.json`
        * `www-app/src/lib/contracts/FighterToken3.json`
        * `www-app/src/lib/contracts/FighterToken4.json`

* `www-app/src/lib/pool0.json`

    * Contains the addresses of the launch pools used for round 0 (initial distribution of POW before any fighting begins). Up to 12 pools can be used.

* `www-app/src/config.json`

    * Contains the network ID the client is working with. Use `42` for Kovan, `1` for mainnet.

* `www-app/src/lib/contracts/*.json`

    * Contain the ABIs of all contracts deployed with `contracts/deploy.js` (the deploy script creates the JSONs automatically).

    * The client also relies on `Governance.json` and `PowerToken.json` for the contract addresses. Make sure the deploy script set them correctly (they're on the bottom) and make sure they're keyed under the correct network ID.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### Deployment

This section has moved here: https://facebook.github.io/create-react-app/docs/deployment
