import { Stack } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { MessageId } from '../../app/intl';
import { getOtherPlayerIndex, parsePlayerIndex } from '../../models/player';
import { ConfirmPasswordButton } from '../players/ConfirmPasswordButton';
import { gameRoutes } from './GameConfigurationPage';
import { addShip, removeShip, replaceShip, selectGamePlayers, shipTypes } from './gameSlice';
import { PlayerGameConfiguration, PlayerGameConfigurationProps } from './PlayerGameConfiguration';

export function PlayerGameConfigurationPageFragment() {
  const params = useParams();
  const index = parsePlayerIndex(params[gameRoutes.player.parameterName]);
  const players = useAppSelector(selectGamePlayers);
  const player = players[index];
  if (!player) {
    throw new TypeError('Invalid player indexes should have be handled by the page component!');
  }

  const [unlocked, setUnlocked] = useState(player.ships.length === 0);
  const [lastIndex, setLastIndex] = useState(NaN);
  useEffect(() => {
    setUnlocked(player.ships.length === 0);
    setLastIndex(index);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

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

  const enemyIndex = getOtherPlayerIndex(index);

  return lastIndex === index && unlocked ? (
    <PlayerGameConfiguration
      id={index}
      board={players[enemyIndex].enemyBoard}
      ships={player.ships}
      shipTypes={shipTypes}
      onShipAdd={handleShipAdd}
      onShipReplace={handleShipReplace}
      onShipRemove={handleShipRemove}
    />
  ) : (
    <Stack direction="row" alignItems="stretch">
      <ConfirmPasswordButton
        className="w-100"
        playerIndex={index}
        title={<FormattedMessage id={MessageId.ShowMyBoardAction} />}
        onPasswordConfirmAttempt={(confirmed) => setUnlocked(confirmed)}
      />
    </Stack>
  );
}
