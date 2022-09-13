import {
  MessageId,
  MessageParameterName,
  MessagePrimitiveValues,
  MessageWithValues,
} from '../../intl';
import { PlayerIndex } from '../../models/player';

export function getIntlPlayerName(index: PlayerIndex): MessageWithValues {
  return { id: MessageId.PlayerName, values: getIntlPlayerNameValues(index) };
}

export function getIntlPlayerNameValues(index: PlayerIndex): MessagePrimitiveValues {
  return { [MessageParameterName.MessageId]: index + 1 };
}

export interface PlayerProps {
  index: PlayerIndex;
}
