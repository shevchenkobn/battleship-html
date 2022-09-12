import React, { useEffect, useMemo } from 'react';
import { IntlProvider } from 'react-intl';
import { useAppDispatch, useAppSelector } from './app/hooks';
import { AppHeader } from './components/AppHeader';
import { AppRouter } from './components/AppRouter';
import { DocumentTitle } from './features/meta/DocumentTitle';
import Container from '@mui/material/Container';
import { LocalizeTitle } from './features/meta/LocalizeTitle';
import { selectAppLocale, setLocale } from './features/meta/metaSlice';
import { getSupportedSystemLocale, getIntlMessages } from './intl';
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
  return (
    <IntlProvider locale={locale} messages={messages}>
      <LocalizeTitle />
      <div className="App">
        <DocumentTitle />
        <AppHeader />
        <Container className="App-main">
          <AppRouter />
        </Container>
      </div>
    </IntlProvider>
  );
}

export default AppLayout;
