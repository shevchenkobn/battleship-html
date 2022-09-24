import { Button, Stack } from '@mui/material';
import Typography from '@mui/material/Typography';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { MessageId } from '../../app/intl';
import { defaultBoardSize, GameStatus } from '../../models/game';
import { selectPlayers } from '../players/playersSlice';
import { setStatus, shipTypes } from './gameSlice';
import { PlayerGameView } from './PlayerGameView';
import { PlayerName } from './PlayerName';

export function GameStartPage() {
  const players = useAppSelector(selectPlayers);
  const dispatch = useAppDispatch();

  return (
    <Stack alignItems="center" justifyContent="center" spacing={1}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 2, md: 4 }}>
        <PlayerName player={players[0]} index={0} />
        <Typography variant="h3" sx={{ lineHeight: 'inherit' }}>
          vs
        </Typography>
        <PlayerName player={players[1]} index={1} />
      </Stack>
      <Button
        size="large"
        color="secondary"
        variant="contained"
        onClick={() => dispatch(setStatus(GameStatus.Configuring))}
      >
        <FormattedMessage id={MessageId.PlayAction} />
      </Button>
      <PlayerGameView boardSize={defaultBoardSize} shipTypes={shipTypes} />
    </Stack>
  );
}
