import { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { parsePlayerIndex } from '../../models/player';
import { gameRoutes } from './GameConfigurationPage';
import { addShip, removeShip, replaceShip, selectGamePlayers, shipTypes } from './gameSlice';
import { PlayerGameConfiguration, PlayerGameConfigurationProps } from './PlayerGameConfiguration';

export function PlayerGameConfigurationPageFragment() {
  const params = useParams();
  const index = parsePlayerIndex(params[gameRoutes.player.parameterName]);
  const player = useAppSelector(selectGamePlayers)[index];
  if (!player) {
    throw new TypeError('Invalid player indexes should have be handled by the page component!');
  }
  const dispatch = useAppDispatch();
  const handleShipAdd = useCallback<PlayerGameConfigurationProps['onShipAdd']>(
    (shipType, direction, shipCells) =>
      dispatch(addShip({ playerIndex: index, shipType, direction, shipCells })),
    [dispatch, index]
  );
  const handleShipReplace = useCallback<PlayerGameConfigurationProps['onShipReplace']>(
    (ship) => dispatch(replaceShip({ playerIndex: index, ship })),
    [dispatch, index]
  );
  const handleShipRemove = useCallback<PlayerGameConfigurationProps['onShipRemove']>(
    (shipId) => dispatch(removeShip({ playerIndex: index, shipId })),
    [dispatch, index]
  );

  return (
    <PlayerGameConfiguration
      id={index}
      board={player.board}
      ships={player.ships}
      shipTypes={shipTypes}
      onShipAdd={handleShipAdd}
      onShipReplace={handleShipReplace}
      onShipRemove={handleShipRemove}
    />
  );
}
