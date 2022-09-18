import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { routes } from '../app/routing';
import { useGamePage } from '../features/game/hooks';

export function AppRouter() {
  const [Component, getSubRoutes] = useGamePage();
  return (
    <>
      <Routes>
        <Route path={routes.game.path} element={<Component />} children={getSubRoutes()} />
        <Route path={routes.player.path} element={routes.player.element} />
        <Route path="*" element={<Navigate to={routes.game.path} />} />
      </Routes>
    </>
  );
}
