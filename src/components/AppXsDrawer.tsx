import {
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Theme,
  useMediaQuery,
} from '@mui/material';
import Toolbar from '@mui/material/Toolbar';
import * as React from 'react';
import Drawer from '@mui/material/Drawer';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';
import { useNavigationLinks } from '../app/routing';
import { Locale } from '../app/intl';
import { useAppLanguageMenuItems } from './useAppLanguageMenuItems';
import { useAppMenuItems } from './useAppMenuItems';

const drawerWidth = 240;

export interface AppSmDrawerProps {
  isDrawerOpen: boolean;
  onDrawerClose(): void;
  onLanguageSelect(locale: Locale): void;
}

export function AppXsDrawer({ isDrawerOpen, onDrawerClose, onLanguageSelect }: AppSmDrawerProps) {
  const navigationLinks = useNavigationLinks();
  const menuItems = useAppMenuItems();
  const languageMenuItems = useAppLanguageMenuItems();

  return (
    <Drawer
      container={window.document.body}
      variant="temporary"
      open={isDrawerOpen}
      onClose={onDrawerClose}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile.
      }}
      sx={{
        display: { xs: 'block', sm: 'none' },
        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
      }}
    >
      <Toolbar sx={{ backgroundColor: 'primary.main' }} />
      <Divider />
      <List>
        {navigationLinks.map((link) => (
          <ListItem key={link.to} disablePadding sx={{ display: 'flex' }}>
            <ListItemButton
              selected={link.isActive}
              component={Link}
              to={link.to}
              onClick={() => onDrawerClose()}
            >
              <ListItemIcon>
                <link.Icon />
              </ListItemIcon>
              <ListItemText>
                <FormattedMessage id={link.label} />
              </ListItemText>
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        {menuItems.map(([item, linkTo, isActive]) => (
          <ListItem key={linkTo} disablePadding sx={{ display: 'flex' }}>
            <ListItemButton
              selected={isActive}
              component={Link}
              to={linkTo}
              onClick={() => onDrawerClose()}
            >
              {item}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        {languageMenuItems.map(([item, locale, isActive]) => (
          <ListItem key={locale} disablePadding sx={{ display: 'flex' }}>
            <ListItemButton selected={isActive} onClick={() => onLanguageSelect(locale)}>
              {item}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
}

export function useAppXsDrawerOpen(isDrawerOpen: boolean) {
  const matchesXs = useMediaQuery<Theme>((theme) => theme.breakpoints.down('sm'));
  return isDrawerOpen && matchesXs;
}
