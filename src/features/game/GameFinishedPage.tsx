import { Button, Stack } from '@mui/material';
import Typography from '@mui/material/Typography';
import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { MessageId } from '../../app/intl';
import { routes } from '../../app/routing';
import { GameStatus } from '../../models/game';
import { getOtherPlayerIndex } from '../../models/player';
import { setTitle } from '../meta/metaSlice';
import { selectPlayers } from '../players/playersSlice';
import { selectCurrentPlayer, setGameStatus } from './gameSlice';
import { useAssertGameStatus, useTypographyVariant } from './hooks';
import { PlayerName } from './PlayerName';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

export function GameFinishedPage() {
  useAssertGameStatus(GameStatus.Finished);

  const index = useAppSelector(selectCurrentPlayer);
  const enemyIndex = getOtherPlayerIndex(index);
  const players = useAppSelector(selectPlayers);

  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(setTitle(''));
  }, [dispatch]);

  const typographyVariant = useTypographyVariant();

  return (
    <Stack direction="column" spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 0, sm: 3 }}>
        <Typography variant={typographyVariant}>
          <FormattedMessage id={MessageId.GameWinner} />:
        </Typography>
        <PlayerName player={players[index]} index={index} />
      </Stack>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 0, sm: 3 }}>
        <Typography variant={typographyVariant}>
          <FormattedMessage id={MessageId.GameLoser} />:
        </Typography>
        <PlayerName player={players[enemyIndex]} index={enemyIndex} />
      </Stack>
      <Button
        variant="contained"
        color="secondary"
        size="large"
        endIcon={<PlayArrowIcon />}
        component={Link}
        to={routes.game.path}
        replace={true}
        onClick={() => dispatch(setGameStatus(GameStatus.Starting))}
      >
        <FormattedMessage id={MessageId.NewGameAction} />
      </Button>
    </Stack>
  );
}
