import { Button, Stack } from '@mui/material';
import Typography from '@mui/material/Typography';
import React, { useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useAppSelector } from '../../app/hooks';
import { DeepReadonly } from '../../app/types';
import { computerPlayerKindMessageIds, MessageId, MessageParameterName } from '../../intl';
import { defaultBoardSize } from '../../models/game';
import { Player, PlayerKind } from '../../models/player';
import { playerKindIcons } from '../players/lib';
import { selectPlayers } from '../players/playersSlice';
import { CellGrid } from './CellGrid';

export function GameStartPage() {
  const players = useAppSelector(selectPlayers);

  return (
    <Stack alignItems="center" justifyContent="center" spacing={1}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 2, md: 4 }}>
        <PlayerName player={players[0]} index={0} />
        <Typography variant="h3">vs</Typography>
        <PlayerName player={players[1]} index={1} />
      </Stack>
      <Button size="large" color="secondary" variant="contained">
        <FormattedMessage id={MessageId.PlayAction} />
      </Button>
      <CellGrid
        points={[
          { x: -1, y: -2 },
          { x: 0, y: -2 },
          { x: 1, y: 0 },
        ]}
      />
    </Stack>
  );
}

interface PlayerNameProps {
  player: Player;
  index: number;
}

function PlayerName({ player, index }: PlayerNameProps) {
  const genericName = useMemo(
    () => (
      <FormattedMessage
        id={MessageId.PlayerName}
        values={{ [MessageParameterName.PlayerName]: index }}
      />
    ),
    [index]
  );
  const isComputer = player.kind === PlayerKind.Computer;
  const playerName = useMemo(
    () =>
      isComputer ? (
        <FormattedMessage id={computerPlayerKindMessageIds[player.type]} />
      ) : (
        player.name
      ),
    [isComputer, player]
  );
  const Icon = playerKindIcons[player.kind];
  return (
    <Stack direction="row" alignItems="center">
      <Icon fontSize="large" />
      {playerName ? (
        <Stack alignItems={{ xs: 'start', sm: 'center' }} className="w-100">
          <Typography variant="h2">{playerName}</Typography>
          <Typography variant="h5">{genericName}</Typography>
        </Stack>
      ) : (
        <Typography variant="h2" className="w-100">
          {genericName}
        </Typography>
      )}
    </Stack>
  );
}
