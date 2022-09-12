import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { MessageWithValues } from '../../intl';
import { Player, PlayerKind } from '../../models/player';
import { PlayerProps } from './lib';
import { selectPlayers, updatePlayer } from './playersSlice';
import { PlayerView } from './PlayerView';

export interface PlayerContainerProps extends PlayerProps {
  intlPlayerName: MessageWithValues;
}

export function PlayerContainer({ index, intlPlayerName }: PlayerContainerProps) {
  const player = useAppSelector(selectPlayers)[index];
  const dispatch = useAppDispatch();

  const isComputerAllowed = index !== 0;
  const [editing, setEditing] = useState(false);
  useEffect(() => setEditing(false), [index]);
  const playerUpdated = (player: Player) => {
    if (!isComputerAllowed && player.kind === PlayerKind.Computer) {
      throw new TypeError('Player 1 cannot be a computer!');
    }
    dispatch(updatePlayer({ index, player }));
  };
  return (
    <PlayerView
      intlPlayerName={intlPlayerName}
      showPlayerKindToggle={isComputerAllowed}
      player={player}
      isReadonly={!editing}
      onEditingChange={setEditing}
      onPlayerChange={playerUpdated}
    />
  );
}
