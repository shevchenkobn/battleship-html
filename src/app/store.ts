import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import counterReducer from '../features/counter/counterSlice';
import metaReducer from '../features/meta/metaSlice';
import playersReducer from '../features/players/playersSlice';
import { StoreSliceName } from './constants';

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    [StoreSliceName.Meta]: metaReducer,
    [StoreSliceName.Players]: playersReducer,
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
