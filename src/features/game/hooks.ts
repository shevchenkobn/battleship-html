import { TypographyProps, useMediaQuery, useTheme } from '@mui/material';
import { amber } from '@mui/material/colors';
import { Breakpoint } from '@mui/system/createTheme/createBreakpoints';
import { iterate } from 'iterare';
import React, { useMemo } from 'react';
import { secondaryColor } from '../../app/constants';
import { noWhenDefault, when } from '../../app/expressions';
import { useAppSelector } from '../../app/hooks';
import { GuardedMap } from '../../app/map';
import { DeepReadonly, DeepReadonlyGuardedMap, t } from '../../app/types';
import { GameStatus, Ship, ShipType } from '../../models/game';
import { GameConfigurationPage, getGameConfigurationSubRoutes } from './GameConfigurationPage';
import { GameFinishedPage } from './GameFinishedPage';
import { GamePlayPage } from './GamePlayPage';
import { selectGameStatus } from './gameSlice';
import { GameStartPage } from './GameStartPage';

export const cellSizeBreakpoints = {
  galaxyFold: 281,
  iphoneXr: 415,
  xl: 'xl' as Breakpoint,
};

export function useCellSizePx() {
  const theme = useTheme();
  const matchesGalaxyFold = useMediaQuery(theme.breakpoints.down(cellSizeBreakpoints.galaxyFold));
  const matchesIphoneXr = useMediaQuery(theme.breakpoints.down(cellSizeBreakpoints.iphoneXr));
  const matchesXl = useMediaQuery(theme.breakpoints.up(cellSizeBreakpoints.xl));
  // By default, .spacing() multiplies by 8px.
  return Number.parseFloat(
    theme.spacing(matchesGalaxyFold ? 3 : matchesIphoneXr ? 4 : matchesXl ? 7 : 6)
  );
}

export function useTypographyVariant(): TypographyProps['variant'] {
  const theme = useTheme();
  const matchesGalaxyFold = useMediaQuery(theme.breakpoints.down(cellSizeBreakpoints.galaxyFold));
  const matchesIphoneXr = useMediaQuery(theme.breakpoints.down(cellSizeBreakpoints.iphoneXr));
  return matchesGalaxyFold ? 'h4' : matchesIphoneXr ? 'h3' : 'h2';
}

export function useGamePage() {
  const status = useAppSelector(selectGameStatus);
  return useMemo(
    () =>
      when<[React.ComponentType, () => JSX.Element[]], GameStatus>(
        status,
        [
          [GameStatus.Starting, () => [GameStartPage, () => []]],
          [GameStatus.Configuring, () => [GameConfigurationPage, getGameConfigurationSubRoutes]],
          [GameStatus.Playing, () => [GamePlayPage, () => []]],
          [GameStatus.Finished, () => [GameFinishedPage, () => []]],
        ],
        noWhenDefault
      ),
    [status]
  );
}

export interface GameColors {
  boardShip: string;
  selectedShip: string;
  placingShip: string;
  emptyHit: string;
  shipHit: string;
  surroundingShipWater: string;
  hoveredLines: string;
}

export function useGameColors(): GameColors {
  const theme = useTheme();
  return useMemo(
    () => ({
      boardShip: theme.palette.success.light,
      selectedShip: theme.palette.info.light,
      placingShip: theme.palette.secondary.light,
      emptyHit: theme.palette.warning.light,
      shipHit: theme.palette.error.light,
      surroundingShipWater: amber[100],
      hoveredLines: secondaryColor[100],
    }),
    [theme]
  );
}

export function useShipTypeMap(
  shipEntities: DeepReadonly<ShipType[]>
): DeepReadonlyGuardedMap<number, ShipType> {
  return useMemo(
    () => new GuardedMap(iterate(shipEntities).map((type) => t(type.shipTypeId, type))),
    [shipEntities]
  );
}

export function useShipMap(
  shipEntities: DeepReadonly<Ship[]>
): DeepReadonlyGuardedMap<number, Ship> {
  return useMemo(
    () => new GuardedMap(iterate(shipEntities).map((ship) => t(ship.shipId, ship))),
    [shipEntities]
  );
}

export function useAssertGameStatus(status: GameStatus) {
  const gameStatus = useAppSelector(selectGameStatus);
  if (gameStatus !== status) {
    throw new TypeError(`Unexpected non-playing game status - ${gameStatus}, expected ${status}`);
  }
}
