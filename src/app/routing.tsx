import { SvgIcon } from '@mui/material';
import React, { useMemo } from 'react';
import { useMatch } from 'react-router-dom';
import { PlayerPage } from '../features/players/PlayerPage';
import { ScoreboardPage } from '../features/scoreboard/ScoreboardPage';
import { MessageId } from './intl';
import { DeepReadonly } from './types';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import ScoreboardIcon from '@mui/icons-material/Scoreboard';

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
    scoreboard: {
      path: '/scoreboard',
      label: MessageId.ScoreboardTitle,
      element: <ScoreboardPage />,
    },
  };
  routes.player.path = routes.player.pathPrefix + '/:' + routes.player.parameterName;
  return routes as DeepReadonly<typeof routes>;
})();

export interface NavigationLink {
  to: string;
  isActive: boolean;
  label: string;
  Icon: typeof SvgIcon;
}

export function useNavigationLinks(): NavigationLink[] {
  const gameRouteMatches = useMatch({ path: routes.game.path, end: false });
  const scoreboardRouteMatches = useMatch({ path: routes.scoreboard.path, end: false });
  return useMemo(
    () => [
      {
        to: routes.game.path,
        isActive: !!gameRouteMatches,
        label: routes.game.label,
        Icon: SportsEsportsIcon,
      },
      {
        to: routes.scoreboard.path,
        isActive: !!scoreboardRouteMatches,
        label: routes.scoreboard.label,
        Icon: ScoreboardIcon,
      },
    ],
    [gameRouteMatches, scoreboardRouteMatches]
  );
}
