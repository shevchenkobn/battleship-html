import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import metaReducer from '../features/meta/metaSlice';
import playersReducer from '../features/players/playersSlice';
import gameReducer from '../features/game/gameSlice';
import { StoreSliceName } from './constants';

export const store = configureStore({
  reducer: {
    [StoreSliceName.Meta]: metaReducer,
    [StoreSliceName.Players]: playersReducer,
    [StoreSliceName.Game]: gameReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
