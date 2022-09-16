import { createSlice } from '@reduxjs/toolkit';
import { StoreSliceName } from '../../app/constants';
import type { RootState } from '../../app/store';
import { DeepReadonly, DeepReadonlyArray } from '../../app/types';
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
  reducers: {},
});

export default gameSlice.reducer;

// export const selectShipTypes = (state: RootState) => state.game.
