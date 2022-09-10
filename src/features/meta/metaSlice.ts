import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { defaultProjectName, StoreSliceName } from '../../app/constants';
import { RootState } from '../../app/store';
import { defaultLocale, Locale } from '../../intl';

export interface MetaSlice {
  projectName: string;
  documentTitle: string;
  appTitle: string;
  title: string;
  titleLocalized: boolean;
  appLocale: Locale;
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
    setTitle(state, action: PayloadAction<string>) {
      state.title = action.payload;
      if (!state.titleLocalized) {
        setTitles(state, state.title);
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

function assertLocalized(state: MetaSlice) {
  if (!state.titleLocalized) {
    throw new TypeError(
      `Title is set automatically using "${setTitle.name}" action if no localization.`
    );
  }
}

export const { setTitle, setLocale, setTitleLocalized, updateTitles } = metaSlice.actions;

export default metaSlice.reducer;

export const selectAppTitle = (state: RootState) => state.meta.appTitle;
export const selectTitle = (state: RootState) => state.meta.title;
export const selectDocumentTitle = (state: RootState) => state.meta.documentTitle;
export const selectAppLocale = (state: RootState) => state.meta.appLocale;
