import React, { useEffect } from 'react';
import { IntlProvider } from 'react-intl';
import { useAppDispatch, useAppSelector } from './app/hooks';
import { AppHeader } from './components/AppHeader';
import { AppRouter } from './components/AppRouter';
import { DocumentTitle } from './features/meta/DocumentTitle';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import { LocalizeTitle } from './features/meta/LocalizeTitle';
import { selectAppLocale, setLocale } from './features/meta/metaSlice';
import { getSupportedSystemLocale, localeToMessages } from './intl';
import logo from './logo.svg';
import { Counter } from './features/counter/Counter';
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
  return (
    <IntlProvider locale={locale} messages={localeToMessages[locale]}>
      <LocalizeTitle />
      <div className="App">
        <DocumentTitle />
        <AppHeader />
        <Container className="App-main">
          <AppRouter />
        </Container>
        {/*<header className="App-header">*/}
        {/*  <img src={logo} className="App-logo" alt="logo" />*/}
        {/*  <Counter />*/}
        {/*  <p>*/}
        {/*    Edit <code>src/App.tsx</code> and save to reload.*/}
        {/*  </p>*/}
        {/*  <span>*/}
        {/*    <span>Learn </span>*/}
        {/*    <a*/}
        {/*      className="App-link"*/}
        {/*      href="https://reactjs.org/"*/}
        {/*      target="_blank"*/}
        {/*      rel="noopener noreferrer"*/}
        {/*    >*/}
        {/*      React*/}
        {/*    </a>*/}
        {/*    <span>, </span>*/}
        {/*    <a*/}
        {/*      className="App-link"*/}
        {/*      href="https://redux.js.org/"*/}
        {/*      target="_blank"*/}
        {/*      rel="noopener noreferrer"*/}
        {/*    >*/}
        {/*      Redux*/}
        {/*    </a>*/}
        {/*    <span>, </span>*/}
        {/*    <a*/}
        {/*      className="App-link"*/}
        {/*      href="https://redux-toolkit.js.org/"*/}
        {/*      target="_blank"*/}
        {/*      rel="noopener noreferrer"*/}
        {/*    >*/}
        {/*      Redux Toolkit*/}
        {/*    </a>*/}
        {/*    ,<span> and </span>*/}
        {/*    <a*/}
        {/*      className="App-link"*/}
        {/*      href="https://react-redux.js.org/"*/}
        {/*      target="_blank"*/}
        {/*      rel="noopener noreferrer"*/}
        {/*    >*/}
        {/*      React Redux*/}
        {/*    </a>*/}
        {/*  </span>*/}
        {/*</header>*/}
      </div>
    </IntlProvider>
  );
}

export default AppLayout;
