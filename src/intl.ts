import { MessageFormatElement } from '@formatjs/icu-messageformat-parser';
import { defaultProjectName } from './app/constants';

export enum Locale {
  English = 'en',
  Ukrainian = 'uk',
}

export const defaultLocale = Locale.English;

export enum MessageId {
  Name = 'name',
  Language = 'language',
  PlayAction = 'action.play',
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

// MessageFormatElement[]
export const localeToMessages: Record<Locale, Record<MessageId, string>> = {
  [Locale.English]: {
    [MessageId.Name]: defaultProjectName,
    [MessageId.Language]: 'English (UK)',
    [MessageId.PlayAction]: 'Play!',
  },
  [Locale.Ukrainian]: {
    [MessageId.Name]: 'Морський Бій',
    [MessageId.Language]: 'Українська',
    [MessageId.PlayAction]: 'Грати!',
  },
};
