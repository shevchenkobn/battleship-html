import { ListItemIcon, ListItemText } from '@mui/material';
import React, { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useMatch } from 'react-router-dom';
import { useAppSelector } from '../app/hooks';
import { routes } from '../app/routing';
import { getIntlPlayerName, playerKindIcons } from '../features/players/lib';
import { selectPlayers } from '../features/players/playersSlice';
import { computerPlayerKindMessageIds, ia } from '../intl';
import { parsePlayerIndex, PlayerIndex, PlayerKind } from '../models/player';

export function useAppMenuItems(): [element: JSX.Element, url: string, isActive: boolean][] {
  const intl = useIntl();
  const players = useAppSelector(selectPlayers);
  const playersUrlMatch = useMatch(routes.player.path);

  return useMemo(
    () =>
      players.map((p, i) => {
        const name =
          p.kind === PlayerKind.Human
            ? p.name || <em>{intl.formatMessage(...ia(getIntlPlayerName(i as PlayerIndex)))}</em>
            : intl.formatMessage({ id: computerPlayerKindMessageIds[p.type] });
        const Icon = playerKindIcons[p.kind];
        return [
          <>
            <ListItemIcon>
              <Icon />
            </ListItemIcon>
            <ListItemText>{name}</ListItemText>
          </>,
          routes.player.formatPath(i),
          !!playersUrlMatch &&
            parsePlayerIndex(playersUrlMatch.params[routes.player.parameterName]) === i,
        ];
      }),
    [intl, players, playersUrlMatch]
  );
}
