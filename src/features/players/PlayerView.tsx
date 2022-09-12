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
import Box from '@mui/material/Box';
import { useState } from 'react';
import { noWhenDefault, when } from '../../app/expressions';
import { ComputerPlayerType, Player, PlayerKind, playerKinds } from '../../models/player';

export interface PlayerViewProps {
  defaultPlayerName: string;
  showPlayerKindToggle: boolean;
  isEditing: boolean;
  player: Player;
  onEditingChange(isEditing: boolean): void;
  onPlayerChange(player: Player): void;
}

export function PlayerView({
  defaultPlayerName,
  showPlayerKindToggle,
  isEditing,
  player: originalPlayer,
  onEditingChange,
  onPlayerChange,
}: PlayerViewProps) {
  const [player, setPlayer] = useState(originalPlayer);

  const form = (
    <Box
      component="form"
      // sx={{
      //   '& .MuiTextField-root': { m: 1, width: '25ch' },
      // }}
      // noValidate
      // autoComplete="off"
    >
      {player.kind === PlayerKind.Human ? (
        <div>
          <TextField
            id="player-name"
            value={player.name}
            onChange={(event) => {
              setPlayer({ ...player, name: String(event.target.value) });
            }}
            label="Player Name"
            placeholder={defaultPlayerName}
            InputProps={{
              readOnly: isEditing,
            }}
          />
          <TextField
            type="password"
            id="player-password"
            value={player.password}
            onChange={(event) => {
              setPlayer({ ...player, password: String(event.target.value) });
            }}
            label="Password"
            InputProps={{
              readOnly: isEditing,
            }}
            helperText="Can be empty, but don't say anyone ;)"
          />
        </div>
      ) : (
        <></>
      )}
    </Box>
  );
  return (
    <Card>
      <CardContent>
        {showPlayerKindToggle ? (
          <Stack>
            {isEditing ? (
              <ToggleButtonGroup
                color="primary"
                value={player.kind}
                exclusive
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
                  <ToggleButton key={kind} value="kind">
                    kind
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            ) : (
              <Chip label={player.kind} color="primary" />
            )}
            <Divider />
            {form}
          </Stack>
        ) : (
          <>{form}</>
        )}
      </CardContent>
      <CardActions>
        {isEditing ? (
          <Button startIcon={<EditIcon />} onClick={() => onEditingChange(true)}>
            Edit
          </Button>
        ) : (
          <>
            <Button
              color="secondary"
              startIcon={<CancelIcon />}
              onClick={() => {
                onEditingChange(false);
                setPlayer(originalPlayer);
              }}
            >
              Cancel
            </Button>{' '}
            <Button
              startIcon={<CheckCircleIcon />}
              onSubmit={(event) => {
                onPlayerChange(player);
                onEditingChange(false);
                event.preventDefault();
              }}
            >
              Save
            </Button>
          </>
        )}
      </CardActions>
    </Card>
  );
}
