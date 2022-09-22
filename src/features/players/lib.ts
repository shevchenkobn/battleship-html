import ComputerIcon from '@mui/icons-material/Computer';
import PermIdentityIcon from '@mui/icons-material/PermIdentity';
import { SvgIcon } from '@mui/material';
import {
  MessageId,
  MessageParameterName,
  MessagePrimitiveValues,
  MessageWithValues,
} from '../../intl';
import { PlayerIndex, PlayerKind } from '../../models/player';

export function getIntlPlayerName(index: number): MessageWithValues {
  return { id: MessageId.PlayerName, values: getIntlPlayerNameValues(index) };
}

export function getIntlPlayerNameValues(index: number): MessagePrimitiveValues {
  return { [MessageParameterName.PlayerName]: index + 1 };
}

export interface PlayerProps {
  index: PlayerIndex;
}

export const playerKindIcons: Record<PlayerKind, typeof SvgIcon> = {
  [PlayerKind.Human]: PermIdentityIcon,
  [PlayerKind.Computer]: ComputerIcon,
};
