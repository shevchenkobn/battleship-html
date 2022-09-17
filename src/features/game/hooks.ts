import { TypographyProps, useMediaQuery, useTheme } from '@mui/material';
import { Breakpoint } from '@mui/system/createTheme/createBreakpoints';
import React, { FunctionComponent } from 'react';
import { noWhenDefault, when } from '../../app/expressions';
import { useAppSelector } from '../../app/hooks';
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
  return when<[React.ComponentType, () => JSX.Element[]], GameStatus>(
    status,
    [
      [GameStatus.Starting, () => [GameStartPage, () => []]],
      [GameStatus.Configuring, () => [GameConfigurationPage, getGameConfigurationSubRoutes]],
    ],
    noWhenDefault
  );
}
