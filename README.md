# Battleship game

This is the implementation of a classic battleship game.

The board size is 10x10, each player has 5 ships:
- one 1x5 Carrier;
- one 1x4 Battleship;
- two 1x3 Cruiser;
- one 1x2 Destroyer;

Each player is allowed to make only one shot per turn (it doesn't depend on how many ships you have or how many hits or misses your got).

## Starting the project

There is no need to clone the repository and build the project. There is a pre-built standalone HTML file (you don't need a web server).

Just download [/build/index.html](./build/index.html), and you can open it in any browser. The interface works fine even on mobile devices.

## Technologies

This project was developed with:
- [Create React App](https://github.com/facebook/create-react-app) - for initial configuration;
- [WebPack 5](https://webpack.js.org/concepts/) - for building the project;
- [Redux](https://redux.js.org/) and [Redux Toolkit](https://redux-toolkit.js.org/) - for state management;
- [React Router](https://reactrouter.com/en/6.4.0) - for routing;
- [Material UI (MUI)](https://mui.com/) - as a component and styling library;
- [react-intl](https://formatjs.io/docs/getting-started/installation/) - for localization;
- [Jest](https://jestjs.io/) - for testing;
- other small utility libraries, which can be found in [package.json](./package.json);

Since it is a game, it would make more sense to use a game engine, such as [Phaser](https://phaser.io/). But I used React since it is a more popular framework. I have an example of a [game using phaser](https://github.com/shevchenkobn/phaser-game).  

## Additional Features

### Localisation

The project contains Ukrainian and English (GB) localisations. The localisation is read from the browser's locale. English is used as a fallback.

The localisation can be easily switched from the menu.

### Name & Password

Each player can set a name for themselves.

To improve the player experience during the game, each player can set an optional password. The password is used to:
- confirm the game start;
- see own board during the game process;

The password allows to minimise the probability of enemy seeing the ship arrangement.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.

The tests cover only algorithmic parts of the project. The tests can be found in files `*.{test,spec}.{ts,tsx}`, where:
- `spec` files are for non-React code unit-tests;
- `test` files are for React code unit-tests (using [@testing-library](https://testing-library.com/) libraries);

The project doesn't have a large coverage because it would require a lot of time to design either unit-tests mocks or end-to-end tests (e.g. using Cypress) to cover not many potential bugs. The project follows the trade-off between time and automating testing of tedious components and functions.

All not tested features (testing technical debt) and all design choices are described in details in the test files themselves. 

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

All required files and resources are inlined inside [/build/index.html](./build/index.html) file, so there is no need for a static server.

For more details on how [WebPack](https://webpack.js.org/concepts/) was configured to be used in such a way, please, search the project for `inlineBuild:` and the relevant comments. The initial configuration files were taken from [create-react-app](https://github.com/facebook/create-react-app) after running `npm run eject`.

### `npm run lint:es`

Run the linter for `*.{js,jsx,ts,tsx}` files inside [/src](./src) directory. The [ESLint](https://eslint.org/) is used together with [Prettier](https://github.com/prettier/eslint-config-prettier).

To fix autofixable issues, please, run:
```sh
npm run lint:es -- --fix
```

### `npm run lint:style`

Run the linter for all files inside [/src](./src) directory, because styles can be included in different ways in different forms. The [Stylelint](https://stylelint.io/) is used together with [Prettier](https://github.com/prettier/stylelint-config-prettier).

To fix autofixable issues, please, run:
```sh
npm run lint:style -- --fix
```

### `npm run lint`

Runs `npm run lint:es` and `npm run lint:style` in parallel.

To fix autofixable issues, please, run:
```sh
npm run lint:style -- -- --fix
```

### `npm run husky`

A helper command for [Husky](https://typicode.github.io/husky/#/) Git Hook, which makes sure that the code style in the project is correct and the tests are not failing.

Runs `npm run lint` and `npm run test -- --watchAll=false` in parallel.

The hook is run on all files rather than git-staged files only ([`lint-staged`](https://www.npmjs.com/package/lint-staged) is not used) because:
- the project is small, so the hook doesn't take much time;
- it is more reliable;
- `lint-staged` can abuse `git stash` by adding tens of entries.

### `npm run prepare`

Installs [Husky](https://typicode.github.io/husky/#/). It is run automatically after `npm install`.

## User Interface Guidelines

The User Interface (UI) was developed according to [Material guidelines](https://material.io/). Default Material color palette is preserved intentionally.

The main idea behind the UI design is to make sure that UI accurately represents the current state of the application and the player can navigate to each state easily and intuitively. Such effect is achieved through:
- Minimising the amount of clicks, mouse movements and keyboard actions; 
- Asking the player if they want to leave the page to make sure the game is not lost;
- Trying to use dialogs as little as possible, because they block entire screen and reduces the area for user interaction;
- Using dialogs for showing messages, which require user attention and the user mustn't be allowed to normally continue using the app;
- When reporting errors, make the error message as detailed as possible.
- Trying to do your best to keep all the pages to have permanent links (e.g. `/game` - game, `/game/player/{index}` - game board configuration, `/players/{index}` - players name and password configuration page).
- When using routing, keeping all information only as part of the path, optional query parameters. Avoiding use of browser route `state` property;
- Designing forms in such a way, that shown values always correspond to model data. If not, it must have a way to revert the form changes. Example: when editing the player, there must be a "Cancel" button to go back to initial state;
- Making sure UI is adaptive and usable at all times, especially on mobile devices. The board cell size and font size gradually decreases with the screen decrease;
- Reusing [Material UI (MUI)](https://mui.com/) components as much as possible for design consistency and predictability;
- Using MUI theme as much as possible. This would allow changing the styles globally;
- Preferring using external SCSS files (not SCSS modules).
- Use SCSS styling for reusable styles;

## Project Architecture

The project is designed predominantly using _Functional Paradigm_. It follows DRY principle, maximises use of pure functions, immutability and SOLID principles (through functional paradigm) as much as possible.

The project groups entities (e.g. interfaces, classes, functions) into files by feature, it doesn't follow the entity-per-file rule.

The project uses a **feature-based** project structure:
- [/src/features/*](./src/features) - features of the app. Each feature contains a Redux Toolkit slice and several components of this feature. Component files might contain non-exported (private) components. It can also contain other helpers files;
- [/src/app](./src/app) - place for final Redux store initializing, styles, localisation, global utilities and helpers;
- [/src/models](./src/models) - interfaces and files to work with them. The files are grouped semantically (i.e. everything related to the feature in one place), not one entity (e.g. interface, class, function, enum) per one file;
- [/src/app](./src/svg) - non-Material SVG loaders;
- [/src/app](./src/test-lib) - place to store utilities for testing;
- [/src/components](./src/components) - shared components;
- [/src/*.{ts,d.ts,tsx,scss}](./src) - global app configuration and app bootstrapping;
- [/public/*](./public) - HTML template to be used during building the project and static files to be included by the HTML template directly.

The files, not mentioned above, are used for build and development process.

### State Machines

The project uses 2 state machines:
- Game page state machine for changing the rendered component depending on state of the game: 'Starting', 'Configuring', 'Playing', 'Finished';
- Game configuration state machine for putting the ships on the board. The states are main states 'Adding Ship', 'Adjusting Ship', 'Idle' and auxiliary (for updating the Redux store) 'Added Ship', 'Replaced Ship', 'Removed Ship';

### Code Style

`ESLint` and `Stylelint`, both with `Prettier`, are used to ensure the code style. They use recommended presets with minimum of custom changes.

TypeScript/ESLint notes:
- a plugin for automatically handling issues with React hooks; 
- callback `props` follow the convention `onEventNameNoun` for the `props` name and `handleEventNameNoun` for the handler's name in parent component, e.g. `onShipUpdate` and `handleShipUpdate`.

### Component Responsibility

The React components have well-defined single responsibilities. This simplifies component reusability and testing. They can be annotated by the name suffix (e.g. [PlayerPage](./src/features/players/PlayerPage.tsx), [PlayerContainer](./src/features/players/PlayerContainer.tsx), [PlayerView](./src/features/players/PlayerView.tsx)):
- **Layout** - is an entry point to the application. It doesn't rely on props much. It can take initialisation data from global constants. It **can** use Redux store. Contains _Router_, which is rendered as _Page_ components;
- **Page** - is rendered through React Router. It doesn't have props and uses routing hooks (e.g. `useParams`) to get its initialisation data. It **can** use Redux store. Contains other types of components;
- **PageFragment** - is rendered by a nested route. It doesn't have props and uses routing hooks (e.g. `useParams`) to get its initialisation data. It **can** use Redux store. Contains other types of components, except for _Page_ components;
- **Container** - is rendered by _Page_, _PageFragment_ . It uses `props` to get its initialisation data. It **can** use Redux store. Can contain other types of components, except for _Page_ and _PageFragment_ components;
- **View** - is rendered by **any** type of component. It _heavily_ uses `props` to get its initialisation data. It **cannot** use Redux store. Can contain **only View** components;

_Container_ and _View_ components might not have a suffix in their name, but they still follow the guideline above.

### Extensibility

**The project intentionally overengineered** and violates KISS principle to enable possible game rule variations. I would avoid certain complicated solutions used in this project in other projects, because it would make maintaining real projects more complicated.

The models and partially the Redux store and components are implemented to simplify:
- enabling use of non-rectangular boards or boards with islands;
- adding not straight (e.g. non-linear) or non-rectangular ships;
- easily enabling players to continue shooting until a miss (a variation popular in Ukraine) i.e. if player hits a ship, they can continue shooting until the first miss.

### Technical Debt Control
- All known issues, implementation and tests flaws are documented either as comments in the code or as notes and TODOs in this file;
- FIXMEs in code comments stand for issues, which have a known solution, that wasn't used due different reasons explained in the comment. It has a higher priority than TODOs;
- TODOs in this [README.md](./README.md) file stand for issues, which might have or have not a solution right now and could be revisited in the future;
- Remove all unneeded logs (e.g. `console.log`);
- Most of the comments must be removed. Making sure that during debug you mark all comments with `dbg`, so that it is easier and safe to remove, even if it wasn't removed initially. Other comments might contain alternative implementation.

### Notes

#### Packages at [package.json](./package.json)
- Some packages are not used. They were copied from my earlier projects to showcase the libraries I would be using. All the libraries were meticulously selected;
- Not all build packages are up-to-date because it might break WebPack build;
- I tried fixing NPM vulnerabilities, but fixing them only reveals more vulnerabilities;

### Unused React Features
- Normally, the web projects need to inject server URL and other values during build. I didn't add config, because it is not needed. The type-safe config can be created from environment variables with regex [REACT_APP at /config/env.js#L61](./config/env.js#L61);
- This project didn't need a custom React context, but React Contexts can be used to share state between components or other global features such as authentication;

## TODO
- scoreboard (localstorage);
- simple AI (no probabilistic heuristics to shoot an unknown cell);
- Fix "center" ship list column rendering in @media sm - md.
- Fix vertical alignment of "vs" and "Play" button for different length of player names (the names must flex-grow, but they don't :'( ).
- Fix "Unknown child route" on change to configuration page.

## Improvements:
- Add game timer;
- Add game turn history;
- Add localised letter-number coordinates to the board;
- Implement additional game rules:
  - continue shooting until miss;
  - add board selection between 10x10 (named 'Skirmish') and 5x5 ('Drill') boards;
  - add custom non-rectangular board with islands. Perhaps, different players could have different cell layout, but same amount of water. The name of the board would be 'Terraforming';
- Add persisting network scoreboard;
- Add game export (encrypt using password);
- Make a more secure implementation of passwords confirmation during game start.