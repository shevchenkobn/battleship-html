import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import LockIcon from '@mui/icons-material/Lock';
import {
  Alert,
  AlertTitle,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Divider,
  makeStyles,
  Popover,
  Stack,
  TextField,
  Theme,
  ToggleButton,
  ToggleButtonGroup,
  useTheme,
} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Typography from '@mui/material/Typography';
import { useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { noWhenDefault, when } from '../../app/expressions';
import { AlertDialog } from '../../components/AlertDialog';
import { ia, MessageId, MessageWithValues, playerKindMessageIds } from '../../intl';
import {
  ComputerPlayerType,
  hasPassword as hasPlayerPassword,
  Player,
  PlayerKind,
  playerKinds,
} from '../../models/player';
import { PasswordDialog } from './PasswordDialog';

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

  const hasPassword = useMemo(() => hasPlayerPassword(originalPlayer), [originalPlayer]);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  useEffect(() => {
    setPlayer(originalPlayer);
    setShowPasswordDialog(false);
    setShowResetDialog(false);
  }, [originalPlayer]);

  const closeDialog = () => {
    setShowPasswordDialog(false);
  };

  const [anchorHelpEl, setAnchorHelpEl] = useState<HTMLButtonElement | null>(null);

  const finishSavingChanges = (changedPlayer = player) => {
    onPlayerChange(changedPlayer);
    onEditingChange(false);
  };

  const startSavingChanges = () => {
    if (hasPassword) {
      setShowPasswordDialog(true);
    } else {
      finishSavingChanges();
    }
  };

  const form = (
    <>
      {player.kind === PlayerKind.Human ? (
        <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }}>
          <TextField
            id="player-name"
            value={player.name}
            onChange={(event) => {
              setPlayer({ ...player, name: String(event.currentTarget.value) });
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
              setPlayer({ ...player, password: String(event.currentTarget.value) });
            }}
            className="flex-grow"
            label={intl.formatMessage({ id: MessageId.PlayerPasswordLabel })}
            InputProps={{
              readOnly: isReadonly,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="password help"
                    onClick={(event) => {
                      setAnchorHelpEl(event.currentTarget);
                    }}
                    edge="end"
                  >
                    <HelpOutlineIcon />
                  </IconButton>
                  <Popover
                    open={!!anchorHelpEl}
                    anchorEl={anchorHelpEl}
                    onClose={() => {
                      setAnchorHelpEl(null);
                    }}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'center',
                    }}
                  >
                    <Typography sx={{ p: 2 }}>
                      <FormattedMessage id={MessageId.PlayerPasswordDescription} />
                    </Typography>
                  </Popover>
                </InputAdornment>
              ),
            }}
            helperText={intl.formatMessage({ id: MessageId.PlayerPasswordHelper })}
          />
          {hasPlayerPassword(originalPlayer) && (
            <PasswordDialog
              correctPassword={originalPlayer.password}
              open={showPasswordDialog}
              onPasswordSubmit={(confirmed) => {
                if (!confirmed) {
                  return;
                }
                finishSavingChanges();
                closeDialog();
              }}
              onAbortByCloseAttempt={closeDialog}
            />
          )}
          {showResetDialog && (
            <AlertDialog
              open={showResetDialog}
              title={'Do you really want to reset your data?'}
              text={'This action cannot be reverted!'}
              confirmText={<FormattedMessage id={MessageId.ConfirmAction} />}
              cancelText={<FormattedMessage id={MessageId.CancelAction} />}
              onCloseAttempt={(confirmed) => {
                if (!confirmed) {
                  setShowResetDialog(false);
                  return;
                }
                const player: Player = { kind: PlayerKind.Human, name: '', password: '' };
                setPlayer(player);
                finishSavingChanges(player);
              }}
            />
          )}
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
                startIcon={hasPassword ? <LockIcon /> : <CheckCircleIcon />}
                type="submit"
                onClick={(event) => {
                  startSavingChanges();
                  event.preventDefault();
                }}
              >
                <FormattedMessage id={MessageId.SaveAction} />
              </Button>
              <Button
                variant="outlined"
                startIcon={<DeleteIcon />}
                onClick={(event) => {
                  setShowResetDialog(true);
                  event.preventDefault();
                }}
              >
                <FormattedMessage id={MessageId.ResetAction} />
              </Button>
            </>
          )}
        </CardActions>
      </Card>
    </form>
  );
}
