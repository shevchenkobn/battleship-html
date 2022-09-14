import React from 'react';
import { Navigate, Route as ReactRoute, Routes } from 'react-router-dom';
import { DeepReadonly } from '../app/types';
import { GameStartPage } from '../features/game/GameStartPage';
import { PlayerPage } from '../features/players/PlayerPage';
import { MessageId } from '../intl';

export function AppRouter() {
  return (
    <>
      <Routes>
        <ReactRoute path={routes.game.path} element={routes.game.component} />
        <ReactRoute path={routes.player.path} element={routes.player.element} />
        <ReactRoute path="*" element={<Navigate to={routes.game.path} />} />
      </Routes>
    </>
  );
}

export const routes = (() => {
  const routes = {
    game: { path: 'game/start', label: MessageId.PlayAction, component: <GameStartPage /> },
    player: {
      pathPrefix: 'players',
      path: '',
      paramName: 'index',
      formatPath(index: number) {
        return this.pathPrefix + '/' + index;
      },
      element: <PlayerPage />,
    },
  };
  routes.player.path = routes.player.pathPrefix + '/:' + routes.player.paramName;
  return routes as DeepReadonly<typeof routes>;
})();
