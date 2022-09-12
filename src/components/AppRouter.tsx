import React from 'react';
import { Navigate, Route as ReactRoute, Routes } from 'react-router-dom';
import { PlayerPage } from '../features/players/PlayerPage';
import { MessageId } from '../intl';

export function AppRouter() {
  return (
    <>
      <Routes>
        {routes.map((p) => (
          <ReactRoute key={p.path} path={p.path} element={p.component} />
        ))}
        <ReactRoute path="*" element={<Navigate to={gameRoute.path} />} />
      </Routes>
    </>
  );
}

export interface Route {
  path: string;
  label: string;
  component: React.ReactElement;
}

export const gameRoute: Route = { path: 'game', label: MessageId.PlayAction, component: <></> };

export const routes: ReadonlyArray<Readonly<Route>> = [
  gameRoute,
  { path: 'player/:index', label: 'Player', component: <PlayerPage /> },
  // { path: 'compare', label: 'Comparison', component: <GeoMapComparePage /> },
];
