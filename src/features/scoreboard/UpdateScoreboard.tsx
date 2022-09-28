import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { GameStatus } from '../../models/game';
import {
  selectCurrentPlayer,
  selectGameId,
  selectGamePlayers,
  selectGameStatus,
} from '../game/gameSlice';
import { selectPlayers } from '../players/playersSlice';
import { addGameResult, AddGameResultActionPayload } from './scoreboardSlice';

export function UpdateScoreboard() {
  const gameId = useAppSelector(selectGameId);
  const [lastGameId, setLastGameId] = useState(NaN);

  const status = useAppSelector(selectGameStatus);
  const index = useAppSelector(selectCurrentPlayer);
  const players = useAppSelector(selectPlayers);
  const gamePlayers = useAppSelector(selectGamePlayers);

  const dispatch = useAppDispatch();
  useEffect(() => {
    /**
     * Adding to scoreboard was being executed twice if 2 or more games were played without page refresh (store reset).
     */
    if (status === GameStatus.Finished && (Number.isNaN(lastGameId) || gameId > lastGameId)) {
      dispatch(
        addGameResult({
          winner: index,
          players: gamePlayers.map((g, i) => ({
            player: players[i],
            score: g.score,
          })) as AddGameResultActionPayload['players'],
        })
      );
      setLastGameId(gameId);
    }
  }, [dispatch, gameId, gamePlayers, index, lastGameId, players, status]);
  return <></>;
}
