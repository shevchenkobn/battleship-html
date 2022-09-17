import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { defaultProjectName, StoreSliceName } from '../../app/constants';
import { RootState } from '../../app/store';
import { defaultLocale, Locale, MessageWithValues } from '../../intl';

export interface MetaSlice {
  projectName: string;
  documentTitle: string;
  appTitle: string;
  title: MessageWithValues | string;
  titleLocalized: boolean;
  appLocale: Locale;
  redirectNotFound: boolean;
}

export function getDefaultTitle(projectName: string) {
  return projectName;
}

export function formatDocumentTitle(title: string, projectName: string) {
  if (!title) {
    return getDefaultTitle(projectName);
  }
  return `${title} - ${projectName}`;
}
export function formatAppBarTitle(title: string, projectName: string) {
  if (!title) {
    return getDefaultTitle(projectName);
  }
  return `${projectName}: ${title}`;
}

const initialState: MetaSlice = {
  projectName: defaultProjectName,
  title: '',
  documentTitle: formatDocumentTitle('', defaultProjectName),
  appTitle: formatAppBarTitle('', defaultProjectName),
  titleLocalized: false,
  appLocale: defaultLocale,
  redirectNotFound: true,
};

export type TitleLocalizedActionPayload =
  | {
      isLocalized: true;
      projectName: string;
    }
  | {
      isLocalized: false;
    };

const metaSlice = createSlice({
  name: StoreSliceName.Meta,
  initialState,
  reducers: {
    setTitle(state, action: PayloadAction<MessageWithValues | string>) {
      if (
        (state.titleLocalized && typeof action.payload === 'string') ||
        (!state.titleLocalized && typeof action.payload !== 'string')
      ) {
        throw new TypeError(
          'Unexpected title format: string for unlocalized or message with values.'
        );
      }
      state.title = action.payload;
      if (!state.titleLocalized) {
        if (typeof action.payload === 'string') {
          setTitles(state, action.payload);
        } else {
          throw new TypeError('Unexpected localized format!');
        }
      }
    },
    setTitleLocalized(state, action: PayloadAction<TitleLocalizedActionPayload>) {
      state.titleLocalized = action.payload.isLocalized;
      state.projectName = action.payload.isLocalized
        ? action.payload.projectName
        : defaultProjectName;
    },
    updateTitles(state, action: PayloadAction<string>) {
      if (!state.titleLocalized) {
        throw new TypeError(
          `Title is set automatically using "${setTitle.name}" action if no localization.`
        );
      }
      setTitles(state, action.payload);
    },
    setLocale(state, action: PayloadAction<Locale>) {
      state.appLocale = action.payload;
    },
  },
});

function setTitles(state: MetaSlice, title: string) {
  const appBarTitle = formatAppBarTitle(title, state.projectName);
  if (state.appTitle !== appBarTitle) {
    state.appTitle = appBarTitle;
  }
  const documentTitle = formatDocumentTitle(title, state.projectName);
  if (state.documentTitle !== documentTitle) {
    state.documentTitle = documentTitle;
  }
}

export const { setTitle, setLocale, setTitleLocalized, updateTitles } = metaSlice.actions;

export default metaSlice.reducer;

export const selectAppTitle = (state: RootState) => state.meta.appTitle;
export const selectTitle = (state: RootState) => state.meta.title;
export const selectDocumentTitle = (state: RootState) => state.meta.documentTitle;
export const selectAppLocale = (state: RootState) => state.meta.appLocale;
