import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { cloneDeep } from 'lodash-es';
import { StoreSliceName } from '../../app/constants';
import { MessageId } from '../../app/intl';
import { RootState } from '../../app/store';
import { arePointsEqual, assert, DeepReadonly, Point } from '../../app/types';
import {
  Board,
  BoardCell,
  BoardCellStatus,
  cloneShip,
  createBoard,
  createShip,
  Direction,
  GameStatus,
  HitBoardCell,
  Ship,
  ShipType,
  TurnHistory,
} from '../../models/game';
import { getOtherPlayerIndex, PlayerIndex } from '../../models/player';

const hitsPerBonusPoint = 5;

export interface PlayerState {
  ships: Ship[];
  enemyBoard: Board;
  enemySunkShips: Ship[];
  score: number;
}

export const shipTypes: DeepReadonly<ShipType[]> = [
  {
    shipTypeId: 0,
    name: MessageId.ShipNameCarrier,
    cellOffsets1: [
      { x: -1, y: 0 },
      { x: -2, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
    ],
    shipCount: 1,
  },
  {
    shipTypeId: 0,
    name: MessageId.ShipNameBattleship,
    cellOffsets1: [
      { x: -1, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
    ],
    shipCount: 1,
  },
  {
    shipTypeId: 0,
    name: MessageId.ShipNameCruiser,
    cellOffsets1: [
      { x: -1, y: 0 },
      { x: 1, y: 0 },
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
    ships: [],
    enemyBoard: createBoard(),
    enemySunkShips: [],
    score: 0,
  };
}

export interface GameSlice {
  gameId: number;
  status: GameStatus;
  currentPlayer: PlayerIndex;
  history: TurnHistory;
  /**
   * Game state for each player.
   */
  players: [PlayerState, PlayerState];
  lastShipId: number;
}

const initialState: GameSlice = {
  gameId: 0,
  status: GameStatus.Starting,
  currentPlayer: 0,
  history: [],
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
    setGameStatus(
      state,
      action: PayloadAction<Exclude<GameStatus, GameStatus.Finished | GameStatus.Playing>>
    ) {
      if (state.status === GameStatus.Playing && action.payload === GameStatus.Configuring) {
        throw new TypeError('Cannot go back to configuration from playing!');
      } else if (state.status === GameStatus.Playing) {
        throw new TypeError('Use a separate action for starting a game!');
      }
      state.status = action.payload;
      if (state.status === GameStatus.Starting) {
        state.gameId += 1;
        state.currentPlayer = 0;
        state.history = [];
        state.players = [createPlayerState(), createPlayerState()];
        state.lastShipId = 0;
      }
    },
    startGame(state) {
      assertStatus(state, GameStatus.Configuring);
      assert(
        state.players.every((p) => p.ships.length === shipCountForPlayer),
        'Not all ships are set for both players!'
      );
      // TODO: add asserts for types.
      state.status = GameStatus.Playing;
      state.history.push({ cells: [[], []] });
      state.currentPlayer = 0;
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

    shoot(state, action: PayloadAction<DeepReadonly<Point>>) {
      assertStatus(state, GameStatus.Playing);

      const p = action.payload;
      const index = state.currentPlayer;
      const player = state.players[state.currentPlayer];
      const enemyIndex = getOtherPlayerIndex(state.currentPlayer);
      const enemyPlayer = state.players[enemyIndex];
      const shotCell = player.enemyBoard[p.x][p.y];

      switch (shotCell.status) {
        case BoardCellStatus.Hit:
        case BoardCellStatus.NoShip: {
          throw new Error(
            `Cell ${JSON.stringify(p)} is already hit by player ${state.currentPlayer}!`
          );
        }
        case BoardCellStatus.Untouched: {
          shotCell.status = BoardCellStatus.NoShip;
          for (const ship of enemyPlayer.ships) {
            if (ship.shipCells.some((c) => arePointsEqual(c, p))) {
              const hitCell = shotCell as BoardCell as HitBoardCell;
              hitCell.status = BoardCellStatus.Hit;
              hitCell.shipId = ship.shipId;
              break;
            }
          }
          break;
        }
      }

      state.history[state.history.length - 1].cells[index].push(p);

      const cell = shotCell as BoardCell;
      if (cell.status === BoardCellStatus.Hit) {
        const ship = enemyPlayer.ships.find((s) => s.shipId === cell.shipId);
        if (!ship) {
          throw new TypeError(`Unknown ship id#${cell.shipId} was shot by player ${index}.`);
        }
        let isShipSunk = true;
        for (const c of ship.shipCells) {
          if (player.enemyBoard[c.x][c.y].status !== BoardCellStatus.Hit) {
            isShipSunk = false;
            break;
          }
        }
        if (isShipSunk) {
          player.enemySunkShips.push(ship);
          player.score += ship.shipCells.length;
        }

        let comboCount = 0;
        for (let i = state.history.length - 1; i >= 0; i -= 1) {
          const shots = state.history[i].cells[index];
          for (let j = shots.length - 1; j >= 0; j -= 1) {
            const shot = shots[j];
            if (player.enemyBoard[shot.x][shot.y].status === BoardCellStatus.Hit) {
              comboCount += 1;
            } else {
              break;
            }
          }
        }
        player.score += Math.trunc(comboCount / hitsPerBonusPoint) + 1;
      }
    },
    finishPlayerTurn(state) {
      assertStatus(state, GameStatus.Playing);
      assert(
        state.history[state.history.length - 1].cells[state.currentPlayer].length > 0,
        `No hits for player ${state.currentPlayer} on turn ${state.history.length - 1}`
      );
      const nextIndex = getOtherPlayerIndex(state.currentPlayer);
      if (
        state.players[state.currentPlayer].enemySunkShips.length ===
        state.players[nextIndex].ships.length
      ) {
        state.status = GameStatus.Finished;
        return;
      }
      if (nextIndex === 0) {
        state.history.push({ cells: [[], []] });
      }
      state.currentPlayer = nextIndex;
    },
  },
});

export const {
  setGameStatus,
  startGame,
  addShip,
  replaceShip,
  removeShip,
  shoot,
  finishPlayerTurn,
} = gameSlice.actions;

export default gameSlice.reducer;

export const selectGameStatus = (state: RootState) => state.game.status;
export const selectGameId = (state: RootState) => state.game.gameId;
export const selectGamePlayers = (state: RootState) => state.game.players;
export const selectCurrentPlayer = (state: RootState) => state.game.currentPlayer;
export const selectTurnHistory = (state: RootState) => state.game.history;

export function hasShipsInstalled(gamePlayer: DeepReadonly<PlayerState>) {
  return gamePlayer.ships.length === shipCountForPlayer;
}
