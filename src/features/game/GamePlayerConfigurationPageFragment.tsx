import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { parsePlayerIndex } from '../../models/player';
import { gameRoutes } from './GameConfigurationPage';
import { addShip, removeShip, replaceShip, selectGamePlayers, shipTypes } from './gameSlice';
import { PlayerGameConfiguration } from './PlayerGameConfiguration';

export function GamePlayerConfigurationPageFragment() {
  const params = useParams();
  const index = parsePlayerIndex(params[gameRoutes.player.parameterName]);
  const player = useAppSelector(selectGamePlayers)[index];
  if (!player) {
    throw new TypeError('Invalid player indexes should have be handled by the page component!');
  }
  const dispatch = useAppDispatch();

  return (
    <PlayerGameConfiguration
      board={player.board}
      ships={player.ships}
      shipTypes={shipTypes}
      onShipAdd={(shipType, direction, shipCells) =>
        dispatch(addShip({ playerIndex: index, shipType, direction, shipCells }))
      }
      onShipReplace={(ship) => dispatch(replaceShip({ playerIndex: index, ship }))}
      onShipRemove={(shipId) => dispatch(removeShip({ playerIndex: index, shipId }))}
    />
  );
}

/*

 newShips = ships.slice();
 const index = ships.findIndex((s) => s.id === ship.id);
 assert(index >= 0, 'Unknown ship is updated!');
 newShips.splice(index, 1, ship);

 const newShips = ships.filter((s) => s.id !== state.ship.id);
 assert(newShips.length === ships.length, 'An attempt to delete an unknown ship!');
 */
