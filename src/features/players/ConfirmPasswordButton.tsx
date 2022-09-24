import { Button } from '@mui/material';
import React, { useState } from 'react';
import { useAppSelector, useStyleProps } from '../../app/hooks';
import { StyleProps } from '../../app/styles';
import { assert } from '../../app/types';
import { HumanPlayer, PlayerKind } from '../../models/player';
import { PasswordDialog } from './PasswordDialog';
import { selectPlayers } from './playersSlice';
import LockIcon from '@mui/icons-material/Lock';

export interface ConfirmPasswordButtonProps extends StyleProps {
  playerIndex: number;
  title: React.ReactNode;
  onPasswordConfirmAttempt(confirmed: boolean): void;
}

export function ConfirmPasswordButton({
  playerIndex,
  title,
  onPasswordConfirmAttempt,
  ...props
}: ConfirmPasswordButtonProps) {
  const style = useStyleProps(props);
  const player = useAppSelector(selectPlayers)[playerIndex];
  assert(
    player && player.kind === PlayerKind.Human,
    'Player index is out of bounds or player is not human!'
  );
  const playerPassword = (player as HumanPlayer).password || '';

  const [showDialog, setShowDialog] = useState(false);

  const closeDialog = () => {
    setShowDialog(false);
  };

  return (
    <>
      <Button
        {...style}
        startIcon={<LockIcon />}
        variant="contained"
        size="large"
        onClick={() => setShowDialog(true)}
      >
        {title}
      </Button>
      {showDialog && (
        <PasswordDialog
          correctPassword={playerPassword}
          open={showDialog}
          onPasswordSubmit={(confirmed) => {
            if (confirmed) {
              onPasswordConfirmAttempt(confirmed);
              closeDialog();
            }
          }}
          onAbortByClose={closeDialog}
        />
      )}
    </>
  );
}
