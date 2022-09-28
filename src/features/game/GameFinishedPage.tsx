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
import { selectPlayers } from '../players/playersSlice';
import { addGameResult, AddGameResultActionPayload } from '../scoreboard/scoreboardSlice';
import { selectCurrentPlayer, selectGamePlayers, setGameStatus } from './gameSlice';
import { useAssertGameStatus, useTypographyVariant } from './hooks';
import { PlayerName } from './PlayerName';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

export function GameFinishedPage() {
  useAssertGameStatus(GameStatus.Finished);

  const index = useAppSelector(selectCurrentPlayer);
  const enemyIndex = getOtherPlayerIndex(index);
  const players = useAppSelector(selectPlayers);
  const gamePlayers = useAppSelector(selectGamePlayers);

  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(
      addGameResult({
        winner: index,
        players: gamePlayers.map((g, i) => ({
          player: players[i],
          score: g.score,
        })) as AddGameResultActionPayload['players'],
      })
    );
  }, [dispatch, gamePlayers, index, players]);

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
