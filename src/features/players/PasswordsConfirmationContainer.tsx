import { Stack, TextField } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { DeepReadonly } from '../../app/types';
import { computerPlayerKindMessageIds, MessageId, playerKindMessageIds } from '../../app/intl';
import { Player, PlayerKind } from '../../models/player';
import { getIntlPlayerName } from './lib';
import { confirmPasswords, selectPlayers } from './playersSlice';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export function PasswordsConfirmationContainer() {
  const players = useAppSelector(selectPlayers);
  const [passwords, setPasswords] = useState(Array(players.length).fill('') as string[]);
  const [passwordsInvalid, setPasswordsInvalid] = useState(Array(players.length).fill(false));
  const [passwordsConfirmed, setPasswordsConfirmed] = useState(
    players.map((p) => p.kind === PlayerKind.Computer)
  );
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(
      confirmPasswords(
        passwordsConfirmed.every((v) => v) && passwordsInvalid.every((v) => !v)
          ? (passwords as [string, string])
          : false
      )
    );
  }, [passwordsInvalid, passwordsConfirmed, dispatch, passwords]);

  return (
    <Stack spacing={2}>
      {players.map((player, index) => (
        <form key={index} className="flex-grow">
          <TextField
            type="password"
            id={`player-${index}-password`}
            onChange={(event) => {
              const newPasswords = passwords.slice();
              newPasswords[index] = String(event.currentTarget.value);
              setPasswords(newPasswords);
              const newPasswordsInvalid = passwordsInvalid.slice();
              newPasswordsInvalid[index] = false;
              setPasswordsInvalid(newPasswordsInvalid);
              const newPasswordsConfirmed = passwordsConfirmed.slice();
              newPasswordsConfirmed[index] = false;
              setPasswordsConfirmed(newPasswordsConfirmed);
            }}
            className="w-100"
            label={<PlayerPasswordLabel player={player} playerIndex={index} />}
            color={
              player.kind === PlayerKind.Computer ||
              (passwordsConfirmed[index] && !passwordsInvalid[index])
                ? 'success'
                : 'primary'
            }
            error={passwordsInvalid[index]}
            helperText={
              passwordsInvalid[index] && <FormattedMessage id={MessageId.PlayerPasswordWrong} />
            }
            InputProps={{
              readOnly: player.kind === PlayerKind.Computer,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    color={
                      player.kind === PlayerKind.Computer ||
                      (passwordsConfirmed[index] && !passwordsInvalid[index])
                        ? 'success'
                        : 'inherit'
                    }
                    type="submit"
                    aria-label="password confirm"
                    onClick={(event) => {
                      if (player.kind !== PlayerKind.Human) {
                        return;
                      }
                      const newPasswordsInvalid = passwordsInvalid.slice();
                      newPasswordsInvalid[index] = player.password !== passwords[index];
                      setPasswordsInvalid(newPasswordsInvalid);
                      const newPasswordsConfirmed = passwordsConfirmed.slice();
                      newPasswordsConfirmed[index] = true;
                      setPasswordsConfirmed(newPasswordsConfirmed);
                      event.preventDefault();
                    }}
                    edge="end"
                  >
                    <CheckCircleIcon fontSize="large" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </form>
      ))}
    </Stack>
  );
}

interface PlayerPasswordLabelProps {
  player: DeepReadonly<Player>;
  playerIndex: number;
}

function PlayerPasswordLabel({ player, playerIndex }: PlayerPasswordLabelProps) {
  const secondName =
    player.kind === PlayerKind.Human && !player.name ? (
      ''
    ) : (
      <em>
        (
        {player.kind === PlayerKind.Computer ? (
          <FormattedMessage id={computerPlayerKindMessageIds[player.type]} />
        ) : (
          player.name
        )}
        )
      </em>
    );
  return (
    <>
      <FormattedMessage id={playerKindMessageIds[player.kind]} />{' '}
      <FormattedMessage {...getIntlPlayerName(playerIndex)} /> {secondName}{' '}
      <FormattedMessage id={MessageId.PlayerPasswordLabel} />
    </>
  );
}
