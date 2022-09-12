import { PlayerIndex } from './playersSlice';

export function getDefaultPlayerName(index: PlayerIndex) {
  return 'Player ' + (index + 1);
}

export interface PlayerProps {
  index: PlayerIndex;
}
