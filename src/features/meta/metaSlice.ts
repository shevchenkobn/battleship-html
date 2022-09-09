import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ActionType, StoreSliceName } from '../../app/constants';
import { RootState } from '../../app/store';

export interface MetaSlice {
  documentTitle: string;
  appTitle: string;
}

export const projectName = 'BattleShip';
export const defaultTitle = projectName;

export function formatDocumentTitle(title: string) {
  if (!title) {
    return defaultTitle;
  }
  return `${title} - ${projectName}`;
}
export function formatAppBarTitle(title: string) {
  if (!title) {
    return defaultTitle;
  }
  return `${projectName}: ${title}`;
}

const metaSlice = createSlice({
  name: StoreSliceName.Meta,
  initialState: {
    documentTitle: defaultTitle,
    appTitle: defaultTitle,
  },
  reducers: {
    [ActionType.SetTitle](state, action: PayloadAction<string>) {
      const appBarTitle = formatAppBarTitle(action.payload);
      if (state.appTitle !== appBarTitle) {
        state.appTitle = appBarTitle;
      }
      const documentTitle = formatDocumentTitle(action.payload);
      if (state.documentTitle !== documentTitle) {
        state.documentTitle = documentTitle;
      }
    },
  },
});

export const { setTitle } = metaSlice.actions;

export default metaSlice.reducer;

export const selectAppTitle = (state: RootState) => state.meta.appTitle;
export const selectDocumentTitle = (state: RootState) => state.meta.documentTitle;
