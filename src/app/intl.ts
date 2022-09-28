import { PrimitiveType } from 'intl-messageformat';
import { defaultProjectName } from './constants';
import { ComputerPlayerType, PlayerKind } from '../models/player';

export enum Locale {
  English = 'en',
  Ukrainian = 'uk',
}

export const defaultLocale = Locale.English;

export enum MessageId {
  ProjectName = 'app.projectName',
  Language = 'app.language',
  UnrevertableWarning = 'players.reset.text',

  ConfigurationTitle = 'title.configuration',
  ScoreboardTitle = 'title.scoreboard',
  PasswordsConfirmationTitle = 'title.passwordsConfirmation',
  ConfigurationResetAlert = 'alert.configuration.reset',

  ContinueSameNameQuestion = 'title.warn.sameName',
  ContinueSameNameDescriptionQuestion = 'title.sub.warn.sameName',

  PlayerHumanKind = 'player.kind.human',
  PlayerComputerKind = 'player.kind.computer',

  ComputerPlayerTypeRandom = 'player.kind.computer.random',
  ComputerPlayerTypeHeuristic = 'player.kind.computer.heuristic',

  PlayerName = 'players.name',
  PlayerNameLabel = 'players.label.name',
  PlayerPasswordLabel = 'players.label.password',
  PlayerPasswordWrong = 'players.label.wrong',
  PlayerPasswordHelper = 'players.label.password.helper',
  PlayerPasswordDescription = 'players.label.password.description',

  PlayerPasswordConfirmationTitle = 'players.password.confirmation.title',
  PlayerPasswordConfirmationDescription = 'players.password.confirmation.description',

  PlayerResetTitle = 'players.reset.title',

  PlayerUnknown = 'players.unknown',
  PlayerUnknownFull = 'players.unknown.full',

  PlayAction = 'action.play',
  EditAction = 'action.edit',
  CancelAction = 'action.cancel',
  SaveAction = 'action.save',
  ConfirmAction = 'action.confirm',
  ResetAction = 'action.reset',
  CloseAction = 'action.close',
  YesAction = 'action.yes',
  NoAction = 'action.no',
  BackAction = 'action.back',
  NextAction = 'action.next',
  StartGameAction = 'action.startGame',
  NewGameAction = 'action.newGame',
  FinishTurnAction = 'action.finishTurn',
  RotateClockwiseAction = 'action.rotateClockwise',
  RotateCounterClockwiseAction = 'action.rotateCounterClockwise',
  RemoveAction = 'action.remove',
  ShowMyBoardAction = 'action.showMyBoard',

  ViewingStatus = 'status.viewing',
  EditingStatus = 'status.editing',

  Score = 'game.score',
  Turn = 'game.turn',
  SunkTitle = 'game.sunk',
  OwnBoardTitle = 'game.board',
  GameWinner = 'game.winner',
  GameWins = 'game.wins',
  GameLoser = 'game.loser',
  GameDefeats = 'game.defeats',
  ShipNameCarrier = 'game.ship.carrier',
  ShipNameBattleship = 'game.ship.battleship',
  ShipNameCruiser = 'game.ship.cruiser',
  ShipNameDestroyer = 'game.ship.destroyer',

  ClearScoreboardAction = 'scoreboard.action.clear',
  ClearScoreboardQuestion = 'scoreboard.question.clear',
  EmptyScoreboard = 'scoreboard.empty',
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
  PlayerName = 'index',
}

export function getIntlMessages(locale: Locale): Messages {
  switch (locale) {
    case Locale.English:
      return {
        [MessageId.ProjectName]: defaultProjectName,
        [MessageId.Language]: 'English (UK)',
        [MessageId.UnrevertableWarning]: 'This action cannot be reverted!',

        [MessageId.ConfigurationTitle]: 'Configuration',
        [MessageId.ScoreboardTitle]: 'Scoreboard',
        [MessageId.PasswordsConfirmationTitle]: 'Passwords Confirmation',
        [MessageId.ConfigurationResetAlert]: 'Are you sure you want to reset game configuration?',

        [MessageId.ContinueSameNameQuestion]:
          'Do you want to start game with same name for both players?',
        [MessageId.ContinueSameNameDescriptionQuestion]:
          'Both player will have their score saved under the same name in the scoreboard.',

        [MessageId.PlayerHumanKind]: 'Human',
        [MessageId.PlayerComputerKind]: 'Computer',

        [MessageId.ComputerPlayerTypeRandom]: 'Chaotic',
        [MessageId.ComputerPlayerTypeHeuristic]: 'Lawful',

        [MessageId.PlayerName]: `Player {${MessageParameterName.PlayerName}, number}`,
        [MessageId.PlayerNameLabel]: 'Player Name',
        [MessageId.PlayerPasswordLabel]: 'Password',
        [MessageId.PlayerPasswordWrong]: 'Wrong password.',
        [MessageId.PlayerPasswordHelper]: "Can be empty, but don't tell anyone ;)",
        [MessageId.PlayerPasswordDescription]:
          'Password is required to open your board during the game.',

        [MessageId.PlayerPasswordConfirmationTitle]: 'Password Confirmation',
        [MessageId.PlayerPasswordConfirmationDescription]:
          'To confirm your action, please, enter your password.',

        [MessageId.PlayerResetTitle]: 'Do you really want to reset your data?',

        [MessageId.PlayerUnknown]: "PlayerUnknown's",
        [MessageId.PlayerUnknownFull]: 'Unknown Player (wrong URL).',

        [MessageId.PlayAction]: 'Play!',
        [MessageId.EditAction]: 'Edit',
        [MessageId.CancelAction]: 'Cancel',
        [MessageId.SaveAction]: 'Save',
        [MessageId.ConfirmAction]: 'Confirm',
        [MessageId.ResetAction]: 'Reset',
        [MessageId.CloseAction]: 'Close',
        [MessageId.YesAction]: 'Yes',
        [MessageId.NoAction]: 'No',
        [MessageId.BackAction]: 'Back',
        [MessageId.NextAction]: 'Next',
        [MessageId.StartGameAction]: 'Start Game!',
        [MessageId.NewGameAction]: 'Start New Game',
        [MessageId.FinishTurnAction]: 'Finish Turn',
        [MessageId.RotateClockwiseAction]: 'Rotate Clockwise',
        [MessageId.RotateCounterClockwiseAction]: 'Rotate Counter-Clockwise',
        [MessageId.RemoveAction]: 'Remove',
        [MessageId.ShowMyBoardAction]: 'Show My Board',

        [MessageId.ViewingStatus]: 'Viewing',
        [MessageId.EditingStatus]: 'Editing',

        [MessageId.Score]: 'Score',
        [MessageId.Turn]: 'Turn',
        [MessageId.SunkTitle]: 'Sunk',
        [MessageId.OwnBoardTitle]: 'Own Board',
        [MessageId.GameWinner]: 'Winner',
        [MessageId.GameWins]: 'Wins',
        [MessageId.GameLoser]: 'Loser',
        [MessageId.GameDefeats]: 'Defeats',
        [MessageId.ShipNameCarrier]: 'Carrier',
        [MessageId.ShipNameBattleship]: 'Battleship',
        [MessageId.ShipNameCruiser]: 'Cruiser',
        [MessageId.ShipNameDestroyer]: 'Destroyer',

        [MessageId.ClearScoreboardAction]: 'Clear the Scoreboard',
        [MessageId.ClearScoreboardQuestion]: 'Clear the Scoreboard?',
        [MessageId.EmptyScoreboard]: 'Scoreboard is empty.',
      };
    case Locale.Ukrainian:
      return {
        [MessageId.ProjectName]: 'Морський Бій',
        [MessageId.Language]: 'Українська',
        [MessageId.UnrevertableWarning]: 'Цю дію неможливо скасувати!',

        [MessageId.ConfigurationTitle]: 'Налаштування',
        [MessageId.ScoreboardTitle]: 'Таблиця результатів',
        [MessageId.PasswordsConfirmationTitle]: 'Підтвердження паролів',
        [MessageId.ConfigurationResetAlert]: 'Ви впевнені, що хочете зкинути налаштування гри?',

        [MessageId.ContinueSameNameQuestion]: "Продовжити з однаковим ім'ям для обох гравців?",
        [MessageId.ContinueSameNameDescriptionQuestion]:
          "Рахунок для обох графвців буде збережено під одним ім'ям у таблицю результатів.",

        [MessageId.PlayerHumanKind]: 'Людина',
        [MessageId.PlayerComputerKind]: "Комп'ютер",

        [MessageId.ComputerPlayerTypeRandom]: 'Хаотичний',
        [MessageId.ComputerPlayerTypeHeuristic]: 'Законний',

        [MessageId.PlayerName]: `Гравець {${MessageParameterName.PlayerName}, number}`,
        [MessageId.PlayerNameLabel]: "Ім'я користувача",
        [MessageId.PlayerPasswordLabel]: 'Пароль',
        [MessageId.PlayerPasswordWrong]: 'Невірний пароль.',
        [MessageId.PlayerPasswordHelper]: 'Може бути порожнім, але нікому не кажіть ;)',
        [MessageId.PlayerPasswordDescription]:
          'Пароль необхідний, щоб відкрити власну дошку протягом гри.',

        [MessageId.PlayerResetTitle]: 'Ви справді хочете скинути ваші данні?',

        [MessageId.PlayerPasswordConfirmationTitle]: 'Підтвердження паролю',
        [MessageId.PlayerPasswordConfirmationDescription]:
          'Щоб підтвердити Вашу дію, будь ласка, введіть ваш пароль.',

        [MessageId.PlayerUnknown]: 'PlayerUnknown-а',
        [MessageId.PlayerUnknownFull]: 'Невідомий гравець (невірна адреса).',

        [MessageId.PlayAction]: 'Грати!',
        [MessageId.EditAction]: 'Редагувати',
        [MessageId.CancelAction]: 'Відмінити',
        [MessageId.SaveAction]: 'Зберегти',
        [MessageId.ConfirmAction]: 'Підтвердити',
        [MessageId.ResetAction]: 'Скинути',
        [MessageId.CloseAction]: 'Закрити',
        [MessageId.YesAction]: 'Так',
        [MessageId.NoAction]: 'Ні',
        [MessageId.BackAction]: 'Назад',
        [MessageId.NextAction]: 'Далі',
        [MessageId.StartGameAction]: 'Почати гру!',
        [MessageId.NewGameAction]: 'Почати нову гру',
        [MessageId.FinishTurnAction]: 'Завершити хід',
        [MessageId.RotateClockwiseAction]: 'Повернути за годинниковою стрілкою',
        [MessageId.RotateCounterClockwiseAction]: 'Повернути проти годинникової стрілки',
        [MessageId.RemoveAction]: 'Прибрати',
        [MessageId.ShowMyBoardAction]: 'Показати мою дошку',

        [MessageId.ViewingStatus]: 'Перегляд',
        [MessageId.EditingStatus]: 'Редагування',

        [MessageId.Score]: 'Рахунок',
        [MessageId.Turn]: 'Хід',
        [MessageId.SunkTitle]: 'Потоплено',
        [MessageId.OwnBoardTitle]: 'Власна дошка',
        [MessageId.GameWinner]: 'Переможець',
        [MessageId.GameWins]: 'Перемоги',
        [MessageId.GameLoser]: 'Програвший',
        [MessageId.GameDefeats]: 'Поразки',
        [MessageId.ShipNameCarrier]: 'Авіаносець',
        [MessageId.ShipNameBattleship]: 'Лінкор',
        [MessageId.ShipNameCruiser]: 'Крейсер',
        [MessageId.ShipNameDestroyer]: 'Есмінець',

        [MessageId.ClearScoreboardAction]: 'Очистити таблицю результатів',
        [MessageId.ClearScoreboardQuestion]: 'Очистити таблицю результатів?',
        [MessageId.EmptyScoreboard]: 'Таблиця результатів порожня.',
      };
  }
}
