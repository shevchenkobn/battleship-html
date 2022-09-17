import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { StoreSliceName } from '../../app/constants';
import { RootState } from '../../app/store';
import { DeepReadonly } from '../../app/types';
import { MessageId } from '../../intl';
import {
  Board,
  createBoard,
  createShips,
  GameStatus,
  Ship,
  ShipType,
  TurnHistory,
} from '../../models/game';
import { PlayerIndex } from '../../models/player';

export interface PlayerState {
  board: Board;
  ships: Ship[];
  enemyBoard: Board;
  enemyShipSunkCount: number;
  score: number;
}

export const shipTypes: DeepReadonly<ShipType[]> = [
  {
    id: 0,
    name: MessageId.ShipNameCarrier,
    cellOffsets1: [
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 3, y: 0 },
      { x: 4, y: 0 },
    ],
    shipCount: 1,
  },
  {
    id: 0,
    name: MessageId.ShipNameBattleship,
    cellOffsets1: [
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 3, y: 0 },
    ],
    shipCount: 1,
  },
  {
    id: 0,
    name: MessageId.ShipNameCruiser,
    cellOffsets1: [
      { x: 1, y: 0 },
      { x: 2, y: 0 },
    ],
    shipCount: 2,
  },
  {
    id: 0,
    name: MessageId.ShipNameDestroyer,
    cellOffsets1: [{ x: 1, y: 0 }],
    shipCount: 1,
  },
].map((ship, id) => {
  ship.id = id;
  return ship;
});

export const shipCountForPlayer = shipTypes.reduce((sum, p) => sum + p.shipCount, 0);

function createPlayerState(): PlayerState {
  return {
    board: createBoard(),
    ships: createShips(shipTypes),
    enemyBoard: createBoard(),
    enemyShipSunkCount: 0,
    score: 0,
  };
}

export interface GameSlice {
  status: GameStatus;
  isConfigurationConfirmed?: true;
  currentPlayer: PlayerIndex;
  history: TurnHistory;
  /**
   * Game state for each player.
   */
  players: [PlayerState, PlayerState];
}

const initialState: GameSlice = {
  status: GameStatus.Starting,
  currentPlayer: 0,
  history: [],
  players: [createPlayerState(), createPlayerState()],
};

const gameSlice = createSlice({
  name: StoreSliceName.Game,
  initialState,
  reducers: {
    setStatus(state, action: PayloadAction<Exclude<GameStatus, GameStatus.Finished>>) {
      if (state.status === GameStatus.Playing && action.payload === GameStatus.Configuring) {
        throw new TypeError('Cannot go back to configuration from playing!');
      }
      state.status = action.payload;
    },
    setConfigurationConfirmed(state, action: PayloadAction<boolean>) {
      if (action.payload) {
        state.isConfigurationConfirmed = true;
      } else {
        delete state.isConfigurationConfirmed;
      }
    },
  },
});

export const { setStatus } = gameSlice.actions;

export default gameSlice.reducer;

export const selectGameStatus = (state: RootState) => state.game.status;
export const selectGamePlayers = (state: RootState) => state.game.players;
export const selectGameConfigurationConfirmed = (state: RootState) =>
  !!state.game.isConfigurationConfirmed;
