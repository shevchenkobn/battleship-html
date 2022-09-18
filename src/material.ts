import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { createTheme } from '@mui/material/styles';
import { primaryColor, secondaryColor } from './app/constants';

/**
 * The default yet enhanced theme is used.
 *
 * Confirmed at [MUI docs](https://mui.com/material-ui/customization/default-theme/).
 */
export function createAppTheme() {
  return createTheme({
    palette: {
      primary: {
        light: primaryColor[400],
        main: primaryColor[700],
        dark: primaryColor[800],
      },
      secondary: {
        light: secondaryColor[300],
        main: secondaryColor[500],
        dark: secondaryColor[700],
      },
    },
  });
}
