import { Point } from '../../app/types';
import { Player, PlayerIndex } from '../../models/player';
import { PlayerState } from './gameSlice';
import { PlayerName } from './PlayerName';

export interface PlayerGameProps {
  gamePlayer: PlayerState;
  player: Player;
  playerIndex: PlayerIndex;
  onBoardShot(cell: Point): void;
}

export function PlayerGame({ gamePlayer, player, playerIndex, onBoardShot }: PlayerGameProps) {
  return (
    <>
      <PlayerName player={player} index={playerIndex} />
    </>
  );
}
