import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import { Button, MenuItem, Theme, useMediaQuery } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../app/hooks';
import { useNavigationLinks } from '../app/routing';
import { AppTitle } from '../features/meta/AppTitle';
import { selectAppLocale } from '../features/meta/metaSlice';
import { Locale, getIntlMessages, MessageId } from '../app/intl';
import { SvgProps } from '../svg/svg-factory';
import { FlagGb } from '../svg/flags/FlagGb';
import { FlagUa } from '../svg/flags/FlagUa';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { useAppLanguageMenuItems } from './useAppLanguageMenuItems';
import { useAppMenuItems } from './useAppMenuItems';
import { useAppXsDrawerOpen } from './AppXsDrawer';

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

export interface AppHeaderProps {
  isDrawerOpen: boolean;
  onDrawerOpenToggle(): void;
  onLanguageSelect(locale: Locale): void;
}

export function AppHeader({ isDrawerOpen, onDrawerOpenToggle, onLanguageSelect }: AppHeaderProps) {
  const locale = useAppSelector(selectAppLocale);
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

  const FlagIcon = languageFlags[locale];

  const isPositionFixed = useAppXsDrawerOpen(isDrawerOpen);
  const navigationLinks = useNavigationLinks();
  const matchesNotXs = useMediaQuery<Theme>((theme) => theme.breakpoints.up('sm'));
  const menuItems = useAppMenuItems();
  const languages = useAppLanguageMenuItems();

  return (
    <AppBar
      position={isPositionFixed ? 'fixed' : 'static'}
      sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
    >
      <Toolbar>
        <IconButton
          size="large"
          color="inherit"
          aria-label="open drawer"
          onClick={() => onDrawerOpenToggle()}
          edge="start"
          sx={{
            mr: 1,
            display: {
              xs: 'flex',
              sm: 'none',
            },
          }}
        >
          {isDrawerOpen ? <CloseIcon /> : <MenuIcon />}
        </IconButton>
        <Typography variant="h6" noWrap component="div" sx={{ mr: 2 }}>
          <AppTitle />
        </Typography>
        {matchesNotXs && (
          <>
            <Box sx={{ display: 'flex', flexGrow: 1 }}>
              {navigationLinks.map((link) => (
                <Button
                  disabled={link.isActive}
                  startIcon={<link.Icon />}
                  component={Link}
                  to={link.to}
                  key={link.to}
                  sx={{ color: 'white', display: 'flex' }}
                >
                  <FormattedMessage id={link.label} />
                </Button>
              ))}
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
              {languages.map(([item, locale, isActive]) => (
                <MenuItem
                  key={locale}
                  selected={isActive}
                  onClick={() => {
                    onLanguageSelect(locale);
                    // handleLanguageClose();
                  }}
                >
                  {item}
                </MenuItem>
              ))}
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
              {menuItems.map(([item, linkTo, isActive]) => (
                <MenuItem selected={isActive} key={linkTo} component={Link} to={linkTo}>
                  {item}
                </MenuItem>
              ))}
            </Menu>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}
