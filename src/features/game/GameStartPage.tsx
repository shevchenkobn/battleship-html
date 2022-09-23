import { Button, Stack } from '@mui/material';
import Typography from '@mui/material/Typography';
import React, { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { useAppDispatch, useAppSelector, useStyleProps } from '../../app/hooks';
import { StyleProps } from '../../app/styles';
import { computerPlayerKindMessageIds, MessageId, MessageParameterName } from '../../app/intl';
import { defaultBoardSize, GameStatus } from '../../models/game';
import { Player, PlayerKind } from '../../models/player';
import { playerKindIcons } from '../players/lib';
import { selectPlayers } from '../players/playersSlice';
import { setStatus, shipTypes } from './gameSlice';
import { useTypographyVariant } from './hooks';
import { PlayerGame } from './PlayerGame';

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
      <PlayerGame boardSize={defaultBoardSize} shipTypes={shipTypes} />
    </Stack>
  );
}

interface PlayerNameProps extends StyleProps {
  player: Player;
  index: number;
}

function PlayerName(props: PlayerNameProps) {
  const { player, index } = props;
  const styles = useStyleProps(props);
  const typographyVariant = useTypographyVariant();
  const genericName = useMemo(
    () => (
      <FormattedMessage
        id={MessageId.PlayerName}
        values={{ [MessageParameterName.PlayerName]: index + 1 }}
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
    <Stack {...styles} direction="row" alignItems="center">
      <Icon fontSize="large" />
      {playerName ? (
        <Stack alignItems={{ xs: 'start', sm: 'center' }} className="w-100">
          <Typography variant={typographyVariant}>{playerName}</Typography>
          <Typography variant="h5">{genericName}</Typography>
        </Stack>
      ) : (
        <Typography variant={typographyVariant} className="w-100">
          {genericName}
        </Typography>
      )}
    </Stack>
  );
}
