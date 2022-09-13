import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from './app/store';
import AppLayout from './AppLayout';

test('renders learn react link', () => {
  const view = render(
    <Provider store={store}>
      <AppLayout />
    </Provider>
  );

  expect(screen.getByText(/learn/i)).toBeInTheDocument();
});
