import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { Player, PlayerKind } from '../../models/player';
import { PlayerProps } from './lib';
import { selectPlayers, updatePlayer } from './playersSlice';
import { PlayerView } from './PlayerView';

export interface PlayerContainerProps extends PlayerProps {
  defaultPlayerName: string;
}

export function PlayerContainer({ index, defaultPlayerName }: PlayerContainerProps) {
  const player = useAppSelector(selectPlayers)[index];
  const dispatch = useAppDispatch();

  const isComputerAllowed = index === 0;
  const [editing, setEditing] = useState(false);
  const playerUpdated = (player: Player) => {
    if (isComputerAllowed && player.kind === PlayerKind.Computer) {
      throw new TypeError('Player 1 cannot be a computer!');
    }
    dispatch(updatePlayer({ index, player }));
  };
  return (
    <PlayerView
      defaultPlayerName={defaultPlayerName}
      showPlayerKindToggle={isComputerAllowed}
      player={player}
      isEditing={editing}
      onEditingChange={setEditing}
      onPlayerChange={playerUpdated}
    />
  );
}
