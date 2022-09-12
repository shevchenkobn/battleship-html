import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import {
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Divider,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { noWhenDefault, when } from '../../app/expressions';
import { ia, MessageId, MessageWithValues, playerKindMessageIds } from '../../intl';
import { ComputerPlayerType, Player, PlayerKind, playerKinds } from '../../models/player';

export interface PlayerViewProps {
  intlPlayerName: MessageWithValues;
  showPlayerKindToggle: boolean;
  isReadonly: boolean;
  player: Player;
  onEditingChange(isEditing: boolean): void;
  onPlayerChange(player: Player): void;
}

export function PlayerView({
  intlPlayerName,
  showPlayerKindToggle,
  isReadonly,
  player: originalPlayer,
  onEditingChange,
  onPlayerChange,
}: PlayerViewProps) {
  const [player, setPlayer] = useState(originalPlayer);
  const intl = useIntl();
  useEffect(() => setPlayer(originalPlayer), [originalPlayer]);

  const form = (
    <>
      {player.kind === PlayerKind.Human ? (
        <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }}>
          <TextField
            id="player-name"
            value={player.name}
            onChange={(event) => {
              setPlayer({ ...player, name: String(event.target.value) });
            }}
            label={intl.formatMessage({ id: MessageId.PlayerNameLabel })}
            className="flex-grow"
            placeholder={intl.formatMessage(...ia(intlPlayerName))}
            InputProps={{
              readOnly: isReadonly,
            }}
          />
          <TextField
            type="password"
            id="player-password"
            value={player.password}
            onChange={(event) => {
              setPlayer({ ...player, password: String(event.target.value) });
            }}
            className="flex-grow"
            label={intl.formatMessage({ id: MessageId.PlayerPasswordLabel })}
            InputProps={{
              readOnly: isReadonly,
            }}
            helperText={intl.formatMessage({ id: MessageId.PlayerPasswordHelper })}
          />
        </Stack>
      ) : (
        <></>
      )}
    </>
  );
  return (
    <form>
      <Card>
        <CardContent>
          {showPlayerKindToggle ? (
            <Stack spacing={2}>
              {isReadonly ? (
                <Chip
                  label={intl.formatMessage({ id: playerKindMessageIds[player.kind] })}
                  color="primary"
                />
              ) : (
                <ToggleButtonGroup
                  color="primary"
                  value={player.kind}
                  className="flex-grow"
                  exclusive
                  disabled={isReadonly}
                  onChange={(event, value) => {
                    if (value === player.kind) {
                      return;
                    }
                    const newPlayer = when<Player, PlayerKind>(
                      value,
                      [
                        [
                          PlayerKind.Computer,
                          () => ({ kind: PlayerKind.Computer, type: ComputerPlayerType.Random }),
                        ],
                        [
                          PlayerKind.Human,
                          () => {
                            const human =
                              originalPlayer.kind === PlayerKind.Human ? originalPlayer : null;
                            return {
                              kind: PlayerKind.Human,
                              name: human?.name ?? '',
                              password: human?.password ?? '',
                            };
                          },
                        ],
                      ],
                      noWhenDefault
                    );
                    setPlayer(newPlayer);
                  }}
                  aria-label="Player Kind"
                >
                  {playerKinds.map((kind) => (
                    <ToggleButton key={kind} value={kind} className="flex-grow">
                      <FormattedMessage id={playerKindMessageIds[kind]} />
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              )}
              <Divider />
              {form}
            </Stack>
          ) : (
            <>{form}</>
          )}
        </CardContent>
        <CardActions>
          {isReadonly ? (
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => onEditingChange(true)}
            >
              <FormattedMessage id={MessageId.EditAction} />
            </Button>
          ) : (
            <>
              <Button
                color="secondary"
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={() => {
                  onEditingChange(false);
                  setPlayer(originalPlayer);
                }}
              >
                <FormattedMessage id={MessageId.CancelAction} />
              </Button>{' '}
              <Button
                variant="outlined"
                startIcon={<CheckCircleIcon />}
                type="submit"
                onClick={(event) => {
                  onPlayerChange(player);
                  onEditingChange(false);
                  event.preventDefault();
                }}
              >
                <FormattedMessage id={MessageId.SaveAction} />
              </Button>
            </>
          )}
        </CardActions>
      </Card>
    </form>
  );
}
