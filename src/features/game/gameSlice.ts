import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { cloneDeep } from 'lodash-es';
import { StoreSliceName } from '../../app/constants';
import { RootState } from '../../app/store';
import { assert, DeepReadonly, Point } from '../../app/types';
import { MessageId } from '../../intl';
import {
  Board,
  cloneShip,
  createBoard,
  createShip,
  Direction,
  GameStatus,
  Ship,
  ShipType,
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
    shipTypeId: 0,
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
    shipTypeId: 0,
    name: MessageId.ShipNameBattleship,
    cellOffsets1: [
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 3, y: 0 },
    ],
    shipCount: 1,
  },
  {
    shipTypeId: 0,
    name: MessageId.ShipNameCruiser,
    cellOffsets1: [
      { x: 1, y: 0 },
      { x: 2, y: 0 },
    ],
    shipCount: 2,
  },
  {
    shipTypeId: 0,
    name: MessageId.ShipNameDestroyer,
    cellOffsets1: [{ x: 1, y: 0 }],
    shipCount: 1,
  },
].map((type, id) => {
  type.shipTypeId = id;
  return type;
});

export const shipCountForPlayer = shipTypes.reduce((sum, p) => sum + p.shipCount, 0);

function createPlayerState(): PlayerState {
  return {
    board: createBoard(),
    ships: [],
    enemyBoard: createBoard(),
    enemyShipSunkCount: 0,
    score: 0,
  };
}

export interface GameSlice {
  status: GameStatus;
  currentPlayer: PlayerIndex;
  // history: TurnHistory;
  /**
   * Game state for each player.
   */
  players: [PlayerState, PlayerState];
  lastShipId: number;
}

const initialState: GameSlice = {
  status: GameStatus.Starting,
  currentPlayer: 0,
  // history: [],
  players: [createPlayerState(), createPlayerState()],
  lastShipId: 0,
};

function assertStatus(state: DeepReadonly<GameSlice>, status: GameStatus) {
  assert(state.status === status, `Expected status "${status}", got "${state.status}".`);
}

export interface AddShipActionPayload {
  playerIndex: number;
  shipType: DeepReadonly<ShipType>;
  direction: Direction;
  shipCells: DeepReadonly<Point[]>;
}

export interface ReplaceShipActionPayload {
  playerIndex: number;
  ship: DeepReadonly<Ship>;
}

export interface RemoveShipActionPayload {
  playerIndex: number;
  shipId: number;
}

const gameSlice = createSlice({
  name: StoreSliceName.Game,
  initialState,
  reducers: {
    setStatus(
      state,
      action: PayloadAction<Exclude<GameStatus, GameStatus.Finished | GameStatus.Playing>>
    ) {
      if (state.status === GameStatus.Playing && action.payload === GameStatus.Configuring) {
        throw new TypeError('Cannot go back to configuration from playing!');
      } else if (state.status === GameStatus.Playing) {
        throw new TypeError('Use a separate action for starting a game!');
      }
      state.status = action.payload;
    },
    startGame(state) {
      assertStatus(state, GameStatus.Configuring);
      assert(
        state.players.every((p) => p.ships.length === shipCountForPlayer),
        'Not all ships are set for both players!'
      );
      // TODO: add asserts for types.
      state.status = GameStatus.Playing;
    },

    addShip(state, action: PayloadAction<AddShipActionPayload>) {
      assertStatus(state, GameStatus.Configuring);
      // TODO: add asserts for checks;
      const { playerIndex, shipType, direction, shipCells } = action.payload;
      const ship = createShip(shipType, direction, state.lastShipId);
      state.lastShipId += 1;
      ship.shipCells = cloneDeep(shipCells) as Point[];
      state.players[playerIndex].ships.push(ship);
    },
    replaceShip(state, action: PayloadAction<ReplaceShipActionPayload>) {
      assertStatus(state, GameStatus.Configuring);
      const { playerIndex, ship } = action.payload;
      const ships = state.players[playerIndex].ships;
      const index = ships.findIndex((s) => s.shipId === ship.shipId);
      assert(index >= 0, 'Unknown ship is updated!');
      ships[index] = cloneShip(ship);
    },
    removeShip(state, action: PayloadAction<RemoveShipActionPayload>) {
      assertStatus(state, GameStatus.Configuring);
      const { playerIndex, shipId } = action.payload;
      const ships = state.players[playerIndex].ships.filter((s) => s.shipId !== shipId);
      assert(
        state.players[playerIndex].ships.length === ships.length + 1,
        'An attempt to delete an unknown ship!'
      );
      state.players[playerIndex].ships = ships;
    },
  },
});

export const { setStatus, startGame, addShip, replaceShip, removeShip } = gameSlice.actions;

export default gameSlice.reducer;

export const selectGameStatus = (state: RootState) => state.game.status;
export const selectGamePlayers = (state: RootState) => state.game.players;
export function hasShipsInstalled(gamePlayer: DeepReadonly<PlayerState>) {
  return gamePlayer.ships.length === shipCountForPlayer;
}
