import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAppSelector } from '../app/hooks';
import { DeepReadonly } from '../app/types';
import { useGamePage } from '../features/game/hooks';
import { PlayerPage } from '../features/players/PlayerPage';
import { MessageId } from '../intl';

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

export const routes = (() => {
  const routes = {
    game: { path: '/game', label: MessageId.PlayAction },
    player: {
      pathPrefix: '/players',
      path: '',
      parameterName: 'index',
      formatPath(index: number) {
        return this.pathPrefix + '/' + index;
      },
      element: <PlayerPage />,
    },
  };
  routes.player.path = routes.player.pathPrefix + '/:' + routes.player.parameterName;
  return routes as DeepReadonly<typeof routes>;
})();
