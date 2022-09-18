import { useParams } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import { parsePlayerIndex } from '../../models/player';
import { gameRoutes } from './GameConfigurationPage';
import { selectGamePlayers } from './gameSlice';
import { useGameColors } from './hooks';

export function GamePlayerConfigurationPageFragment() {
  const params = useParams();
  const index = parsePlayerIndex(params[gameRoutes.player.parameterName]);
  const player = useAppSelector(selectGamePlayers)[index];
  if (!player) {
    throw new TypeError('Invalid player indexes should have be handled by the page component!');
  }
  const gameColors = useGameColors();
  console.log(gameColors);
  return <>plaee</>;
}
