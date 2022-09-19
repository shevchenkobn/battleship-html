import { TypographyProps, useMediaQuery, useTheme } from '@mui/material';
import { Breakpoint } from '@mui/system/createTheme/createBreakpoints';
import { iterate } from 'iterare';
import React, { useMemo } from 'react';
import { secondaryColor } from '../../app/constants';
import { noWhenDefault, when } from '../../app/expressions';
import { useAppSelector } from '../../app/hooks';
import { GuardedMap } from '../../app/map';
import { DeepReadonly, DeepReadonlyGuardedMap, NonOptional, t } from '../../app/types';
import { GameStatus } from '../../models/game';
import { GameConfigurationPage, getGameConfigurationSubRoutes } from './GameConfigurationPage';
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
        ],
        noWhenDefault
      ),
    [status]
  );
}

export interface GameColors {
  boardShip: string;
  selectedShip: string;
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
      emptyHit: theme.palette.warning.light,
      shipHit: theme.palette.error.light,
      surroundingShipWater: theme.palette.warning.light, // or yellow[200]
      hoveredLines: secondaryColor.A400,
    }),
    [theme]
  );
}

export function useShipEntityMap<T extends { id: number }>(
  shipEntities: DeepReadonly<T[]>
): DeepReadonlyGuardedMap<number, T> {
  return useMemo(
    () =>
      new GuardedMap(
        iterate(shipEntities).map((type) => t(type.id, type as NonOptional<DeepReadonly<T>>))
      ),
    [shipEntities]
  );
}
