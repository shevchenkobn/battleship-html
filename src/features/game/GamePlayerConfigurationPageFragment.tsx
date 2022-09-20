import { useParams } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import { parsePlayerIndex } from '../../models/player';
import { gameRoutes } from './GameConfigurationPage';
import { selectGamePlayers, shipTypes } from './gameSlice';
import { PlayerGameConfiguration } from './PlayerGameConfiguration';

export function GamePlayerConfigurationPageFragment() {
  const params = useParams();
  const index = parsePlayerIndex(params[gameRoutes.player.parameterName]);
  const player = useAppSelector(selectGamePlayers)[index];
  if (!player) {
    throw new TypeError('Invalid player indexes should have be handled by the page component!');
  }

  // return <PlayerGameConfiguration board={player.board} ships={player.ships} onShipAdded={(shipType, direction, shipCells) => } onShipReplace={} onShipRemove={} shipTypes={shipTypes} />;
  return <>player</>;
}
/*

 newShips = ships.slice();
 const index = ships.findIndex((s) => s.id === ship.id);
 assert(index >= 0, 'Unknown ship is updated!');
 newShips.splice(index, 1, ship);

 const newShips = ships.filter((s) => s.id !== state.ship.id);
 assert(newShips.length === ships.length, 'An attempt to delete an unknown ship!');
 */
