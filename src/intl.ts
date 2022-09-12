import { PrimitiveType } from 'intl-messageformat';
import { defaultProjectName } from './app/constants';
import { ComputerPlayerType, PlayerKind } from './models/player';

export enum Locale {
  English = 'en',
  Ukrainian = 'uk',
}

export const defaultLocale = Locale.English;

export enum MessageId {
  ProjectName = 'app.projectName',
  Language = 'app.language',

  PlayerHumanKind = 'player.kind.human',
  PlayerComputerKind = 'player.kind.computer',

  ComputerPlayerTypeRandom = 'player.kind.computer.random',
  ComputerPlayerTypeHeuristic = 'player.kind.computer.heuristic',

  PlayerName = 'players.name',
  PlayerNameLabel = 'players.label.name',
  PlayerPasswordLabel = 'players.label.password',
  PlayerPasswordHelper = 'players.label.password.helper',
  PlayerUnknown = 'players.unknown',
  PlayerUnknownFull = 'players.unknown.full',

  PlayAction = 'action.play',
  EditAction = 'action.edit',
  CancelAction = 'action.cancel',
  SaveAction = 'action.save',
}

export const playerKindMessageIds: Record<PlayerKind, MessageId> = {
  [PlayerKind.Human]: MessageId.PlayerHumanKind,
  [PlayerKind.Computer]: MessageId.PlayerComputerKind,
};

export const computerPlayerKindMessageIds: Record<ComputerPlayerType, MessageId> = {
  [ComputerPlayerType.Random]: MessageId.ComputerPlayerTypeRandom,
  [ComputerPlayerType.Heuristic]: MessageId.ComputerPlayerTypeHeuristic,
};

export type Messages = Record<MessageId, string>;

export type MessagePrimitiveValues = Record<string, PrimitiveType>;

export interface MessageWithValues {
  id: string;
  values?: MessagePrimitiveValues;
}

export type FormatMessageParameters = [{ id: string }, MessagePrimitiveValues?];

export function ia(message: MessageWithValues): FormatMessageParameters {
  return [{ id: message.id }, message.values];
}

export function getSupportedSystemLocale() {
  const supportedLocales = getSupportedLocales() as ReadonlyArray<string>;
  let locale = navigator.languages.find((l) => supportedLocales.includes(l));
  if (!locale) {
    locale = navigator.languages.find((l) => supportedLocales.slice(0, 2).includes(l));
  }
  return locale as Locale | undefined;
}

export function getSupportedLocales() {
  return Object.values(Locale);
}

export enum MessageParameterName {
  // Index = 'index',
  MessageId = 'index',
}

export function getIntlMessages(locale: Locale): Messages {
  switch (locale) {
    case Locale.English:
      return {
        [MessageId.ProjectName]: defaultProjectName,
        [MessageId.Language]: 'English (UK)',

        [MessageId.PlayerHumanKind]: 'Human',
        [MessageId.PlayerComputerKind]: 'Computer',

        [MessageId.ComputerPlayerTypeRandom]: 'Chaotic',
        [MessageId.ComputerPlayerTypeHeuristic]: 'Lawful',

        [MessageId.PlayerName]: `Player {${MessageParameterName.MessageId}, number}`,
        [MessageId.PlayerNameLabel]: 'Player Name',
        [MessageId.PlayerPasswordLabel]: 'Password',
        [MessageId.PlayerPasswordHelper]: "Can be empty, but don't tell anyone ;)",
        [MessageId.PlayerUnknown]: "PlayerUnknown's",
        [MessageId.PlayerUnknownFull]: 'Unknown Player (wrong URL).',

        [MessageId.PlayAction]: 'Play!',
        [MessageId.EditAction]: 'Edit',
        [MessageId.CancelAction]: 'Cancel',
        [MessageId.SaveAction]: 'Save',
      };
    case Locale.Ukrainian:
      return {
        [MessageId.ProjectName]: 'Морський Бій',
        [MessageId.Language]: 'Українська',

        [MessageId.PlayerHumanKind]: 'Людина',
        [MessageId.PlayerComputerKind]: "Комп'ютер",

        [MessageId.ComputerPlayerTypeRandom]: 'Хаотичний',
        [MessageId.ComputerPlayerTypeHeuristic]: 'Законний',

        [MessageId.PlayerName]: `Гравець {${MessageParameterName.MessageId}, number}`,
        [MessageId.PlayerNameLabel]: "Ім'я користувача",
        [MessageId.PlayerPasswordLabel]: 'Пароль',
        [MessageId.PlayerPasswordHelper]: 'Може бути порожнім, але нікому не кажіть ;)',
        [MessageId.PlayerUnknown]: 'PlayerUnknown-а',
        [MessageId.PlayerUnknownFull]: 'Невідомий гравець (невірна адреса).',

        [MessageId.PlayAction]: 'Грати!',
        [MessageId.EditAction]: 'Редагувати',
        [MessageId.CancelAction]: 'Відмінити',
        [MessageId.SaveAction]: 'Зберегти',
      };
  }
}
