import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { StoreSliceName } from '../../app/constants';
import { RootState } from '../../app/store';
import { assert } from '../../app/types';
import { Player, PlayerIndex, PlayerKind } from '../../models/player';

export interface PlayersSlice {
  players: [player1: Player, player2: Player];
  arePasswordsConfirmed: boolean;
}

const initialState: PlayersSlice = {
  players: [
    { kind: PlayerKind.Human, name: '', password: '' },
    { kind: PlayerKind.Human, name: '', password: '' },
  ],
  arePasswordsConfirmed: false,
};

export interface UpdatePlayerActionPayload {
  index: PlayerIndex;
  player: Player;
}

export type PasswordsConfirmActionPayload = false | [string, string];

const playersSlice = createSlice({
  name: StoreSliceName.Players,
  initialState,
  reducers: {
    updatePlayer(state, action: PayloadAction<UpdatePlayerActionPayload>) {
      state.players[action.payload.index] = action.payload.player;
    },
    confirmPasswords(state, action: PayloadAction<PasswordsConfirmActionPayload>) {
      if (action.payload) {
        assert(
          state.players.every(
            (player, index) =>
              player.kind === PlayerKind.Computer ||
              player.password === (action.payload as string[])[index]
          ),
          "Passwords don't match!"
        );
      }
      state.arePasswordsConfirmed = !!action.payload;
    },
  },
});

export const { updatePlayer, confirmPasswords } = playersSlice.actions;

export default playersSlice.reducer;

export const selectPlayers = (state: RootState) => state.players.players;
export const selectPasswordsConfirmed = (state: RootState) => state.players.arePasswordsConfirmed;
