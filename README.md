# Battleship game

This is the implementation of a classic [battleship game](https://en.wikipedia.org/wiki/Battleship_(game)).

The board size is 10x10, each player has 5 ships:
- one 1x5 Carrier;
- one 1x4 Battleship;
- two 1x3 Cruiser;
- one 1x2 Destroyer;

Each player is allowed to make only one shot per turn (it doesn't depend on how many ships you have or how many hits or misses you got).

## Technologies rationale

To cover as many potential end-users as possible, a web-browser HTML, JavaScript & CSS were selected as a technological stack. It was done because almost all operating systems nowadays (Windows, MacOS, Linux, Android, iOS, etc.) have full-fledged web browsers. Moreover, the output of the project is a single HTML file, which includes other resources using data URLs through the WebPack module bundler.

Since I don't have a commercial interest in this project, I am not afraid to expose the source code. Notwithstanding, I perform code obfuscation through the default configuration of the WebPack module bundler for React apps.

## Starting the project

There is no need to clone the repository and build the project. There is a pre-built standalone HTML file (you don't need a web server).

Just download [/build/index.html](./build/index.html), and you can open it in any browser. The interface works fine even on mobile devices.

## Technologies

This project was developed with [React](https://reactjs.org/) framework:
- [Create React App](https://github.com/facebook/create-react-app) - for initial configuration;
- [WebPack 5](https://webpack.js.org/concepts/) - for building the project;
- [Redux](https://redux.js.org/) and [Redux Toolkit](https://redux-toolkit.js.org/) - for state management;
- [React Router](https://reactrouter.com/en/6.4.0) - for routing;
- [Material UI (MUI)](https://mui.com/) - as a UI component and styling library;
- [react-intl](https://formatjs.io/docs/getting-started/installation/) - for localization;
- [Jest](https://jestjs.io/) - for testing;
- other small utility libraries, which can be found in [package.json](./package.json);

I selected technologies with their popularity in mind to increase the future maintainability of the project.

Since it is a game, it would seem to make more sense to use a game engine, such as [Phaser](https://phaser.io/). But I used React since it is a more popular framework and I wouldn't need any of the advanced Phaser's features. I have an example of a [game using Phaser](https://github.com/shevchenkobn/phaser-game).  

## Additional Features

### Localisation

The project contains Ukrainian and English (GB) localisations. The localisation is read from the browser's locale. English is used as a fallback.

The localisation can be easily switched from the menu.

### Name & Password

Each player can set a name for themselves.

To improve the player experience during the game, each player can set an optional password. The password is used to:
- confirm the game start;
- see your own board during the game process;

The password allows for minimising the probability of the enemy seeing the ship arrangement.

### Multiple Games

It is possible to start multiple games on different tabs and all of them will share the scoreboard (using `localStorage`).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.

The tests cover only algorithmic parts of the project. The tests can be found in files `*.{test,spec}.{ts,tsx}`, where:
- `spec` files are for non-React code unit tests;
- `test` files are for React code unit-tests (using [@testing-library](https://testing-library.com/) libraries);

The project doesn't have a large coverage because it would require a lot of time to design either unit-tests mocks or end-to-end tests (e.g. using Cypress) to cover not many potential bugs. The project follows the trade-off between time and automating the testing of tedious components and functions.

All not tested features (testing technical debt) and all design choices are described in detail in the test files themselves. 

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

All required files and resources are inlined inside [/build/index.html](./build/index.html) file, so there is no need for a static server.

For more details on how [WebPack](https://webpack.js.org/concepts/) was configured to be used in such a way, please, search the project for `inlineBuild:` and the relevant comments. The initial configuration files were taken from [create-react-app](https://github.com/facebook/create-react-app) after running `npm run eject`.

### `npm run lint:es`

Run the linter for `*.{js,jsx,ts,tsx}` files inside [/src](./src) directory. The [ESLint](https://eslint.org/) is used together with [Prettier](https://github.com/prettier/eslint-config-prettier).

To fix auto-fixable issues, please, run:
```sh
npm run lint:es -- --fix
```

### `npm run lint:style`

Run the linter for all files inside [/src](./src) directory, because styles can be included in different ways in different forms. The [Stylelint](https://stylelint.io/) is used together with [Prettier](https://github.com/prettier/stylelint-config-prettier).

To fix auto-fixable issues, please, run:
```sh
npm run lint:style -- --fix
```

### `npm run lint`

Runs `npm run lint:es` and `npm run lint:style` in parallel.

To fix auto-fixable issues, please, run:
```sh
npm run lint -- -- --fix
```

### `npm run husky`

Helper command for [Husky](https://typicode.github.io/husky/#/) Git Hook, which makes sure that the code style in the project is correct and the tests are not failing.

Runs `npm run lint` and `npm run test -- --watchAll=false` in parallel.

The hook is run on all files rather than git-staged files only ([`lint-staged`](https://www.npmjs.com/package/lint-staged) is not used) because:
- the project is small, so the hook doesn't take much time;
- it is more reliable;
- `lint-staged` can abuse `git stash` by adding tens of entries.

### `npm run prepare`

Installs [Husky](https://typicode.github.io/husky/#/). It is run automatically after `npm install`.

## User Interface Guidelines

The User Interface (UI) was developed according to [Material guidelines](https://material.io/). The default Material colour palette is preserved intentionally.

The main idea behind the UI design is to make sure that the UI accurately represents the current state of the application and the player can navigate to each state easily and intuitively. Such effect is achieved through:
- Minimising the number of clicks, mouse movements and keyboard actions; 
- Asking the player if they want to leave the page to make sure access to the current game is not lost;
- Trying to use dialogs as little as possible, because they block the entire screen and reduce the area for user interaction;
- Using dialogs for showing messages, which require user attention and the user mustn't be allowed to normally continue using the app;
- When reporting errors, make the error message as detailed as possible.
- Trying to do my best to keep all the pages have permanent links (e.g. `/game` - game, `/game/player/{index}` - game board configuration, `/players/{index}` - players name and password configuration page).
- When using routing, keeping all information only as part of the path, optional query parameters. Avoiding the use of browser route `state` property since it doesn't have a representation in the URL;
- Designing forms in such a way, that shown values always correspond to the data model. If not, it must have a way to revert the form changes. Example: when editing the player, there must be a "Cancel" button to go back to the initial state;
- Making sure UI is adaptive and usable at all times, especially on mobile devices. The board cell size and font size gradually decrease with the screen decrease;
- Reusing [Material UI (MUI)](https://mui.com/) components as much as possible for design consistency and predictability;
- Using MUI theme as much as possible. This would allow changing the styles globally;
- Preferring using external SCSS files (not SCSS modules).
- Use SCSS styling for reusable styles.

## Project Architecture

The project is designed predominantly using _Functional Paradigm_. It follows the DRY principle and maximises the use of pure functions, immutability and SOLID principles (through functional paradigm) as much as possible.

The project groups entities (e.g. interfaces, classes, functions) into files by feature, it doesn't follow the entity-per-file rule (e.g. a separate file for each interface, class, enum, etc).

The project uses a **feature-based** project structure:
- [/src/features/*](./src/features) - features of the app. Each feature contains a Redux Toolkit slice and several components of this feature. Component files might contain non-exported (private) components. It can also contain other helpers files;
- [/src/app](./src/app) - the place for final Redux store initializing, styles, localisation, global utilities and helpers;
- [/src/models](./src/models) - interfaces and files to work with them. The files are grouped semantically (i.e. everything related to the feature in one place), not one entity (e.g. interface, class, function, enum) per one file;
- [/src/svg](./src/svg) - non-Material SVG loaders;
- [/src/test-lib](./src/test-lib) - place to store utilities for testing;
- [/src/components](./src/components) - shared components;
- [/src/*.{ts,d.ts,tsx,scss}](./src) - global app configuration and app bootstrapping;
- [/public/*](./public) - HTML template to be used during building the project and static files to be included by the HTML template directly.

The files, not mentioned above, are used for the build and development process.

### Models

The models used in the project are not entirely normalised to achieve the optimal trade-off between one source of truth and quick access to the required data.

### State Machines

The project uses 2 state machines:
- Game page state machine for changing the rendered component depending on the state of the game: 'Starting', 'Configuring', 'Playing', 'Finished';
- Game configuration state machine for putting the ships on the board. There are main states 'Adding Ship', 'Adjusting Ship', 'Idle' and auxiliary states (for updating the Redux store) 'Added Ship', 'Replaced Ship', 'Removed Ship';

### Code Style

`ESLint` and `Stylelint`, both with `Prettier`, are used to ensure the code style. They use recommended presets with a minimum of custom changes.

TypeScript/ESLint notes:
- a plugin for automatically handling issues with React hooks; 
- callback `props` follow the convention `onEventNameNoun` for the `props` name and `handleEventNameNoun` for the handler's name in the parent component, e.g. `onShipUpdate` and `handleShipUpdate`.

### Component Responsibility

The React components have well-defined single responsibilities. This simplifies component reusability and testing. All component names have a corresponding suffix in their name, except for some _Container_ and _View_ components, where the suffix is optional (e.g. [PlayerPage](./src/features/players/PlayerPage.tsx), [PlayerContainer](./src/features/players/PlayerContainer.tsx), [PlayerView](./src/features/players/PlayerView.tsx)):
- **Layout** - is an entry point to the application. It **doesn't rely on props** much. It can take initialisation data from global constants. It **can** use the Redux store. Contains _Router_, which renders _Page_ components;
- **Page** - is rendered through React Router. It **doesn't have props** and **uses routing hooks** (e.g. `useParams`) to get its initialisation data. It **can** use the Redux store. Contains other types of components;
- **PageFragment** - is rendered by a nested route. It **doesn't have props** and **uses routing hooks** (e.g. `useParams`) to get its initialisation data. It **can** use the Redux store. Contains other types of components, except for _Page_ and _Layout_ components;
- **Container** - is rendered by any type of component except for _Layout_ and _View_. It **uses `props`** to get its initialisation data. It **can** use the Redux store. Can contain other types of components, except for _Layout_, _Page_ and _PageFragment_ components;
- **View** - is rendered by **any** type of component. It **_heavily_ uses `props`** to get its initialisation data. It **cannot** use the Redux store. Can contain **only View** components;


### Extensibility

**The project intentionally overengineered** and violates the KISS principle to make the extension for the new game rules simpler. I would avoid certain complicated solutions used in this project in other projects of this size because it would make maintaining real projects more complicated.

The models, views and the Redux store are implemented to simplify:
- enabling the use of non-rectangular boards or boards with islands (island - a set of connected cells which do not allow placing a ship);
- adding not straight (e.g. non-linear) or non-rectangular ships;
- easily enabling players to continue shooting until a miss (a variation popular in Ukraine) i.e. if a player hits a ship, they can continue shooting until the first miss.

According to the initial analysis, the only thing that needs to be updated to implement the features above is [tryPushFromEdges()](./src/models/game.ts#L107).

### Technical Debt Control

- All known issues, implementation and tests flaws are documented either as comments in the code or as notes and TODOs in this file;
- **FIXME**s in code comments stand for issues, which **have a known solution**, that weren't used due to different reasons explained in the comment. It has a higher priority than TODOs;
- **TODO**s in this [README.md](./README.md#todo) file stand for issues, which **might have or have not a solution** right now and could be revisited in the future;
- It's possible to remove all unneeded logs (e.g. `console.log`);
- Most of the comments must be removed. Making sure that during debugging you mark all comments with `dbg`, so that it is easier and safe to remove, even if it wasn't removed initially. Other comments might contain alternative implementations;
- Versioning in the project isn't implemented since there wasn't a direct necessity and it is not difficult to implement. In addition, if needed, the build process can be extended by additional command line arguments to allow automatic and safe version increment (major, minor or patch version components). Later, a post-commit Git hook can be added to Husky to automatically add a Git tag with the application version.

### Notes

#### Packages at [package.json](./package.json)
- Some packages are not used. They were copied from my earlier projects to showcase the libraries I would be using. All the libraries were meticulously selected;
- Not all building process packages are up-to-date because it might break WebPack build;
- I tried fixing NPM vulnerabilities, but fixing them only reveals more vulnerabilities.

### Unused React Features
- Normally, web projects need to inject server URLs and other values during a build. I didn't add config, because it is not needed. The type-safe config can be created from environment variables with the current prefix `REACT_APP_` (see for regex at [/config/env.js#L61](./config/env.js#L61));
- This project didn't need a custom React context, but React Contexts can be used to share state between components or other global features such as authentication;

## TODO
- Fix "center" ship list column rendering in @media sm - md during game creation.
- Fix vertical alignment of the "vs" label and "Play" button for different lengths of player names (the names must flex-grow, but they don't :'( ).
- Fix "Unknown child route" on the change to the configuration page.

## Improvements (Backlog):
- AI: simple (named 'Chaotic') and heuristic ('Lawful'). Heuristic AI selects the next turn based on gathered statistics and the most likely places of ships. The statistics are to be taken from earlier scientific studies. Full implementation requires:
  - implement AI as a "pure" class (deterministic by parameters, memoises last turns, like `useMemo`);
  - update passwords confirmation since AI doesn't need passwords;
  - prohibit editing player type during the game (add a flag to `players` store slice);
  - update [GamePlayPage](./src/features/game/GamePlayPage.tsx#L41) to use `isShooting = false`, automatically mark the computer shot and disable "Show own board";
  - use tooltips over AI names to explain if it is random or heuristic.
- Create a scoreboard for AI;
- Add game timer;
- Add game turn history visually (the data model is already there);
- Add localised letter-number coordinates to the board (e.g. using Cyrillic for Ukrainian);
- Make the project a PWA (Progressive Web Application) to allow installing the game to the system (e.g. "Add to home screen" dialog on Android or creating a shortcut in Windows);
- Implement additional game rules through additional configuration options:
  - continue shooting until miss;
  - add board selection between 10x10 (named 'Skirmish') and 5x5 ('Drill') boards;
  - add a custom non-rectangular board with islands. Perhaps, different players could have different cell layouts, but the same amount of water. The name of the board would be 'Terraforming';
- Add persisting network scoreboard;
- Add game export and import (encrypting using password);
- Make a more secure implementation of password confirmation during the game start.