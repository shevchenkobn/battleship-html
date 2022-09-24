import { Stack } from '@mui/material';
import Typography from '@mui/material/Typography';
import React, { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { useStyleProps } from '../../app/hooks';
import { computerPlayerKindMessageIds, MessageId, MessageParameterName } from '../../app/intl';
import { StyleProps } from '../../app/styles';
import { Player, PlayerKind } from '../../models/player';
import { playerKindIcons } from '../players/lib';
import { useTypographyVariant } from './hooks';

export interface PlayerNameProps extends StyleProps {
  player: Player;
  index: number;
}

export function PlayerName(props: PlayerNameProps) {
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
