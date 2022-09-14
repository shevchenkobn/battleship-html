import ComputerIcon from '@mui/icons-material/Computer';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import PermIdentityIcon from '@mui/icons-material/PermIdentity';
import { Button, Divider, ListItemIcon, ListItemText, MenuItem } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link, matchPath, matchRoutes, useLocation, useMatch } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { AppTitle } from '../features/meta/AppTitle';
import { selectAppLocale, setLocale } from '../features/meta/metaSlice';
import { getIntlPlayerName, playerKindIcons } from '../features/players/lib';
import { selectPlayers } from '../features/players/playersSlice';
import { Locale, getIntlMessages, MessageId, ia, computerPlayerKindMessageIds } from '../intl';
import { PlayerIndex, PlayerKind } from '../models/player';
import { SvgProps } from '../svg/svg-factory';
import { FlagGb } from '../svg/flags/FlagGb';
import { FlagUa } from '../svg/flags/FlagUa';
import { routes } from './AppRouter';

export const languageFlags: Record<Locale, React.ComponentType<SvgProps>> = {
  [Locale.English]: FlagGb,
  [Locale.Ukrainian]: FlagUa,
};

export const languages = [
  {
    locale: Locale.English,
    name: getIntlMessages(Locale.English)[MessageId.Language],
  },
  {
    locale: Locale.Ukrainian,
    name: getIntlMessages(Locale.Ukrainian)[MessageId.Language],
  },
];

export function AppHeader() {
  const locale = useAppSelector(selectAppLocale);
  const dispatch = useAppDispatch();
  const [anchorTopRightEl, setAnchorTopRightEl] = React.useState<null | HTMLElement>(null);
  const [anchorLanguageEl, setAnchorLanguageEl] = React.useState<null | HTMLElement>(null);
  const intl = useIntl();
  const gameRouteMatch = useMatch(routes.game.path);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorTopRightEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorTopRightEl(null);
  };

  const handleLanguageMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorLanguageEl(event.currentTarget);
  };

  const handleLanguageClose = () => {
    setAnchorLanguageEl(null);
  };

  const handleLanguageSelect = (locale: Locale) => {
    dispatch(setLocale(locale));
    // handleLanguageClose();
  };

  const FlagIcon = languageFlags[locale];

  const players = useAppSelector(selectPlayers).map((p, i) => ({
    kind: p.kind,
    name:
      p.kind === PlayerKind.Human
        ? p.name || <em>{intl.formatMessage(...ia(getIntlPlayerName(i as PlayerIndex)))}</em>
        : intl.formatMessage({ id: computerPlayerKindMessageIds[p.type] }),
  }));

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ mr: 2 }}>
          <AppTitle />
        </Typography>
        <Box sx={{ display: 'flex', flexGrow: 1 }}>
          <Button
            disabled={!!gameRouteMatch}
            component={Link}
            to={routes.game.path}
            sx={{ my: 2, color: 'white', display: 'block' }}
          >
            <FormattedMessage id={routes.game.label} />
          </Button>
        </Box>
        <IconButton
          size="small"
          aria-label="current-language"
          aria-controls="menu-appbar"
          aria-haspopup="true"
          onClick={handleLanguageMenu}
          color="inherit"
        >
          <FlagIcon fontSize={'large'} />
        </IconButton>
        <Menu
          id="languages-appbar"
          sx={{ mt: '45px' }}
          anchorEl={anchorLanguageEl}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          keepMounted
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={Boolean(anchorLanguageEl)}
          onClose={handleLanguageClose}
        >
          {languages.map((item) => {
            const Icon = languageFlags[item.locale];
            return (
              <MenuItem key={item.locale} onClick={() => handleLanguageSelect(item.locale)}>
                <ListItemIcon>
                  <Icon />
                </ListItemIcon>
                <ListItemText>{item.name}</ListItemText>
              </MenuItem>
            );
          })}
        </Menu>
        <IconButton
          size="small"
          aria-label="account of current user"
          aria-controls="menu-appbar"
          aria-haspopup="true"
          onClick={handleMenu}
          color="inherit"
        >
          <PeopleOutlineIcon sx={{ fontSize: 40 }} />
        </IconButton>
        <Menu
          id="players-appbar"
          sx={{ mt: '45px' }}
          anchorEl={anchorTopRightEl}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={Boolean(anchorTopRightEl)}
          onClose={handleClose}
          onClick={handleClose}
        >
          {players.map((p, i) => {
            const Icon = playerKindIcons[p.kind];
            return (
              <MenuItem key={i} component={Link} to={routes.player.formatPath(i)}>
                <ListItemIcon>
                  <Icon />
                </ListItemIcon>
                <ListItemText>{p.name}</ListItemText>
              </MenuItem>
            );
          })}
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
