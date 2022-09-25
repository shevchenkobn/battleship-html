import { blue, purple } from '@mui/material/colors';

export enum StoreSliceName {
  Players = 'players',
  Meta = 'meta',
  Game = 'game',
  Scoreboard = 'scoreboard',
}

export const defaultProjectName = 'BattleShip';

/**
 * Colors according to official Material palette. Verified at:
 * - [MUI docs](https://mui.com/material-ui/customization/color/#playground) - you can convert a library color to name;
 * - [Official Material color picker](https://material.io/resources/color/#!/?view.left=0&view.right=0).
 *
 * Default material colors are used, but we needed more hues, so they are exported fully. See the {@link createAppTheme} for details on preserving the original theme.
 */
export const primaryColor = blue;
/**
 * See comment for {@link primaryColor}.
 */
export const secondaryColor = purple;

export enum LocalStorageKeys {
  /**
   * The key is obscure, because all HTML files opened by `file:///` protocol (from local file system) share same {@link window.localStorage}.
   * @type {LocalStorageKeys.Scoreboard}
   */
  Scoreboard = '__1664102005390.battleship.scoreboard',
}
