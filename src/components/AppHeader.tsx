import { Button, Divider, ListItemIcon, ListItemText, MenuItem } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import PermIdentityIcon from '@mui/icons-material/PermIdentity';
import ComputerIcon from '@mui/icons-material/Computer';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AppTitle } from '../features/meta/AppTitle';
import { gameRoute } from './AppRouter';

export function AppHeader() {
  const location = useLocation();
  const [anchorTopRightEl, setAnchorTopRightEl] = React.useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorTopRightEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorTopRightEl(null);
  };

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
            {gameRoute.label}
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
          <MenuItem onClick={handleClose}>
            <ListItemIcon>
              <PermIdentityIcon />
            </ListItemIcon>
            <ListItemText>
              <em>Player 1</em>
            </ListItemText>
          </MenuItem>
          <MenuItem onClick={handleClose}>
            <ListItemIcon>
              <ComputerIcon />
            </ListItemIcon>
            <ListItemText>Chaotic</ListItemText>
          </MenuItem>
          <Divider />
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
