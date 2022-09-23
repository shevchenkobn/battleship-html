import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import React, { useEffect, useMemo, useState } from 'react';
import { IntlProvider } from 'react-intl';
import { useAppDispatch, useAppSelector } from './app/hooks';
import { AppHeader } from './components/AppHeader';
import { AppRouter } from './components/AppRouter';
import { AppXsDrawer, useAppXsDrawerOpen } from './components/AppXsDrawer';
import { PreventRefresh } from './components/PreventRefresh';
import { DocumentTitle } from './features/meta/DocumentTitle';
import Container from '@mui/material/Container';
import { LocalizeTitle } from './features/meta/LocalizeTitle';
import { selectAppLocale, setLocale } from './features/meta/metaSlice';
import { getSupportedSystemLocale, getIntlMessages, Locale } from './app/intl';
import './AppLayout.scss';

function AppLayout() {
  const locale = useAppSelector(selectAppLocale);
  const dispatch = useAppDispatch();
  useEffect(() => {
    const newLocale = getSupportedSystemLocale();
    if (newLocale) {
      dispatch(setLocale(newLocale));
    }
  }, [dispatch]);
  const messages = useMemo(() => getIntlMessages(locale), [locale]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const needToolbarOffset = useAppXsDrawerOpen(drawerOpen);

  const handleLanguageSelect = (locale: Locale) => {
    dispatch(setLocale(locale));
  };

  return (
    <IntlProvider locale={locale} messages={messages}>
      <PreventRefresh />
      <LocalizeTitle />
      <Box className="App">
        <DocumentTitle />
        <AppHeader
          isDrawerOpen={drawerOpen}
          onDrawerOpenToggle={() => setDrawerOpen(!drawerOpen)}
          onLanguageSelect={handleLanguageSelect}
        />
        <AppXsDrawer
          isDrawerOpen={drawerOpen}
          onDrawerClose={() => setDrawerOpen(false)}
          onLanguageSelect={handleLanguageSelect}
        />
        <Container className="App-main">
          {needToolbarOffset && <Toolbar />}
          <AppRouter />
        </Container>
      </Box>
    </IntlProvider>
  );
}

export default AppLayout;
