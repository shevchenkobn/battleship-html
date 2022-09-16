import { TypographyProps, useMediaQuery, useTheme } from '@mui/material';
import { Breakpoint } from '@mui/system/createTheme/createBreakpoints';

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
