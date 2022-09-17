# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app), using the [Redux](https://redux.js.org/) and [Redux Toolkit](https://redux-toolkit.js.org/) TS template.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Notes
- some libraries from package json are not used, copied from the last project, easier to keep track of cool libraries.
- not all packages up to date because it might break building.
- tried fixing vulnerabilities, but fixing them only increases vulnerabilities;
- didn't add config, but can explain how;
- no need for custom context;
- Quality games can be done using https://github.com/shevchenkobn/phaser-game;
- search project for inlineBuild: ;
- components: layout, page, container (logic), view (view prefix optional);
- ship overengineering for possible extension (see improvements);
- not tested everything (see comments in files for details);
- private (non-exported) components are used to avoid too many files;
- lint-staged is not used because the project is small and lint-staged requires regex, which is not in config;

### TODO
- Fix "center" ship list column rendering in @media sm - md.
- Fix vertical alignment of "vs" and "Play" button for different length of names (the names must flex-grow, but they don't :'( ).
- Fix "Unknown child route" on change to configuration page.

#### Basic version:
- password to make the game quick & safe enough.
- classic rules;
- adaptive mobile UI;
- implement board (with islands, each player has own), ship positioning (not straight) in an extensible way (1d array-like); make ability to continue shooting easy to implement.
- ask about leaving if game started.
- 10x10 board;
- ships: carrier 5x1, battleship 4x1, cruiser 3x2, destroyer 2x1;
- shoot without continuation;
- localisation (ua & uk);
- tests (unit & react, selected functionality);
- user name & password (for checking your board in game, optional);
- scoreboard (localstorage);
- simple AI (no heuristics);

#### Improvements:
- timer;
- continue shooting after hit;
- 5x5 board (names: drill & skirmish);
- custom board with islands, same amount of water (name: terraforming);
- network scoreboard?;
- game export (encrypt using password);
- combine stuff in settings;