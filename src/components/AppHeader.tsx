import ComputerIcon from '@mui/icons-material/Computer';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import PermIdentityIcon from '@mui/icons-material/PermIdentity';
import { Button, Divider, ListItemIcon, ListItemText, MenuItem, SvgIcon } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import React, { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { Link, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { AppTitle } from '../features/meta/AppTitle';
import { selectAppLocale, setLocale } from '../features/meta/metaSlice';
import { getDefaultPlayerName } from '../features/players/lib';
import { PlayerIndex, selectPlayers } from '../features/players/playersSlice';
import { Locale, localeToMessages, MessageId } from '../intl';
import { PlayerKind } from '../models/player';
import { SvgProps } from '../svg/svg-factory';
import { FlagGb } from '../svg/flags/FlagGb';
import { FlagUa } from '../svg/flags/FlagUa';
import { gameRoute } from './AppRouter';

export const languageFlags: Record<Locale, React.ComponentType<SvgProps>> = {
  [Locale.English]: FlagGb,
  [Locale.Ukrainian]: FlagUa,
};

export const languages = [
  {
    locale: Locale.English,
    name: localeToMessages[Locale.English][MessageId.Language],
  },
  {
    locale: Locale.Ukrainian,
    name: localeToMessages[Locale.Ukrainian][MessageId.Language],
  },
];

export function AppHeader() {
  const location = useLocation();
  const locale = useAppSelector(selectAppLocale);
  const dispatch = useAppDispatch();
  const [anchorTopRightEl, setAnchorTopRightEl] = React.useState<null | HTMLElement>(null);
  const [anchorLanguageEl, setAnchorLanguageEl] = React.useState<null | HTMLElement>(null);

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
    handleLanguageClose();
  };

  const FlagIcon = languageFlags[locale];

  const players = useAppSelector(selectPlayers).map((p, i) => ({
    kind: p.kind,
    name:
      p.kind === PlayerKind.Human
        ? p.name || <em>{getDefaultPlayerName(i as PlayerIndex)}</em>
        : p.type,
  }));

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ mr: 2 }}>
          <AppTitle />
        </Typography>
        <Box sx={{ display: 'flex', flexGrow: 1 }}>
          <Button
            disabled={location.pathname === '/' + gameRoute.path}
            component={Link}
            to={gameRoute.path}
            sx={{ my: 2, color: 'white', display: 'block' }}
          >
            <FormattedMessage id={gameRoute.label} />
          </Button>
          {/*{routes.map((page) => (*/}
          {/*  <Button*/}
          {/*    disabled={location.pathname === '/' + page.path}*/}
          {/*    key={page.path}*/}
          {/*    component={Link}*/}
          {/*    to={page.path}*/}
          {/*    sx={{ my: 2, color: 'white', display: 'block' }}*/}
          {/*  >*/}
          {/*    {page.label}*/}
          {/*  </Button>*/}
          {/*))}*/}
        </Box>
        <IconButton
          size="small"
          aria-label="account of current user"
          aria-controls="menu-appbar"
          aria-haspopup="true"
          onClick={handleLanguageMenu}
          color="inherit"
        >
          <FlagIcon fontSize={'large'} />
        </IconButton>
        <Menu
          id="menu-appbar"
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
          id="menu-appbar"
          sx={{ mt: '45px' }}
          anchorEl={anchorTopRightEl}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          keepMounted
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={Boolean(anchorTopRightEl)}
          onClose={handleClose}
        >
          {players.map((p, i) => (
            <MenuItem key={i} component={Link} to={'/player/' + i}>
              <ListItemIcon>
                {p.kind === PlayerKind.Human ? <PermIdentityIcon /> : <ComputerIcon />}
              </ListItemIcon>
              <ListItemText>{p.name}</ListItemText>
            </MenuItem>
          ))}
          {/*<MenuItem onClick={handleClose}>*/}
          {/*  <ListItemIcon>*/}
          {/*    <PermIdentityIcon />*/}
          {/*  </ListItemIcon>*/}
          {/*  <ListItemText>*/}
          {/*    <em>Player 1</em>*/}
          {/*  </ListItemText>*/}
          {/*</MenuItem>*/}
          {/*<MenuItem onClick={handleClose}>*/}
          {/*  <ListItemIcon>*/}
          {/*    <ComputerIcon />*/}
          {/*  </ListItemIcon>*/}
          {/*  <ListItemText>Chaotic</ListItemText>*/}
          {/*</MenuItem>*/}
          {/*<Divider />*/}
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
