import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { StoreSliceName } from '../../app/constants';
import { RootState } from '../../app/store';
import { as, cast } from '../../app/types';
import { HumanPlayer, Player, PlayerKind } from '../../models/player';

export interface PlayersSlice {
  players: [player1: Player, player2: Player];
}

const initialState: PlayersSlice = {
  players: [
    { kind: PlayerKind.Human, name: '', password: '' },
    { kind: PlayerKind.Human, name: '', password: '' },
  ],
};

export interface UpdatePlayerActionPayload {
  index: PlayerIndex;
  player: Player;
}
export type PlayerIndex = 0 | 1;

export function isValidPlayerIndex(index: unknown): index is PlayerIndex {
  return Number.isInteger(index) && as<number>(index) && index >= 0 && index <= 1;
}

const playersSlice = createSlice({
  name: StoreSliceName.Players,
  initialState,
  reducers: {
    updatePlayer(state, action: PayloadAction<UpdatePlayerActionPayload>) {
      state.players[action.payload.index] = action.payload.player;
    },
  },
});

export const { updatePlayer } = playersSlice.actions;

export default playersSlice.reducer;

export const selectPlayers = (state: RootState) => state.players.players;
