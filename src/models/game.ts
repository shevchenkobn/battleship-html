import { iterate } from 'iterare';
import { cloneDeep } from 'lodash-es';
import {
  addPoint,
  decodePoint,
  DeepReadonly,
  DeepReadonlyArray,
  encodePoint,
  Point,
} from '../app/types';
import { MessageId } from '../intl';
import { PlayerIndex } from './player';

export enum GameStatus {
  Starting = 'starting',
  Playing = 'playing',
  Done = 'done',
}

export interface Step {
  /**
   * Cell shoots during step in ascending order for each {@link PlayerIndex}.
   */
  cells: [Point[], Point[]];
}

/**
 * Step history sorted in ascending order.
 */
export type StepHistory = Step[];

export enum BoardCellStatus {
  Untouched = 'untouched',
  Hit = 'hit',
  /**
   * Marks the cell near sunk ship.
   * @type {BoardCellStatus.NoShip}
   */
  NoShip = 'no-ship',
}

export interface BoardCell {
  shipId: number | null;
  status: BoardCellStatus;
}

export function createBoardCell(): BoardCell {
  return {
    shipId: null,
    status: BoardCellStatus.Untouched,
  };
}

export const defaultBoardSize: DeepReadonly<Point> = { x: 10, y: 10 };

/**
 * Board is accessed as `board[x][y]`, X axis is →, Y axis is ↓.
 */
export type Board = BoardCell[][];

export function createBoard(size = defaultBoardSize): Board {
  return Array(size.x).map(() => Array(size.y).map(() => createBoardCell()));
}

export enum Orientation {
  Left = 'left',
  Bottom = 'bottom',
  Right = 'right',
  Top = 'top',
}

export const orientationOrder: ReadonlyArray<Orientation> = Object.values(Orientation);

export const defaultOrientation = orientationOrder[0];

export function rotatePoints(
  points: DeepReadonly<Point[]>,
  from: Orientation,
  to: Orientation
): Point[] {
  const newPoints = cloneDeep(points) as Point[];
  const fromI = orientationOrder.indexOf(from);
  const toI = orientationOrder.indexOf(to);
  const steps = toI - fromI;
  if (steps > 0) {
    for (let i = 0; i < steps; i += 1) {
      for (const p of newPoints) {
        [p.x, p.y] = [-p.y, p.x];
      }
    }
  } else if (steps < 0) {
    for (let i = steps; i < 0; i += 1) {
      for (const p of newPoints) {
        [p.x, p.y] = [p.y, -p.x];
      }
    }
  }
  return newPoints;
}

export function getSurroundingCells(
  points: DeepReadonly<Point[]>,
  size = defaultBoardSize
): Point[] {
  const pointSet = iterate(points).map(encodePoint).toSet();
  const surroundingSet = new Set<string>();
  for (const point of points) {
    for (
      let x = Math.max(point.x - 1, 0), stopX = Math.min(point.x + 2, size.x);
      x < stopX;
      x += 1
    ) {
      for (
        let y = Math.max(point.y - 1, 0), stopY = Math.min(point.y + 2, size.y);
        y < stopY;
        y += 1
      ) {
        const hashed = encodePoint({ x, y });
        if (pointSet.has(hashed)) {
          continue;
        }
        surroundingSet.add(hashed);
      }
    }
  }
  return iterate(surroundingSet).map(decodePoint).toArray();
}

export interface ShipType {
  id: number;
  name: MessageId;
  /**
   * Offsets of ship cells, except the first one (it's always `{ x: 0, y: 0 }`). One-cell chips will have it empty.
   *
   * For example, 2-cell straight ship in {@link Orientation.Left} orientation would have it as `[{ x: 1, y: 0 }]`.
   */
  cellOffsets1: Point[];
  /**
   * Number of ships per player per game.
   */
  shipCount: number;
}

export function applyOffsets(
  point: DeepReadonly<Point>,
  offsets: DeepReadonly<Point[]>,
  includeInitial = true
): Point[] {
  const points = includeInitial ? [{ ...point }] : [];
  for (const offset of offsets) {
    points.push(addPoint(point, offset));
  }
  return points;
}

export function isOutOfBound(point: DeepReadonly<Point>, size: DeepReadonly<Point>): boolean {
  return point.x < 0 || point.x >= size.x || point.y < 0 || point.y >= size.y;
}

export enum ShipStatus {
  Afloat = 'afloat',
  Sunk = 'sunk',
}

export interface Ship {
  id: number;
  // playerIndex: PlayerIndex;
  status: ShipStatus;
  shipTypeId: number;
  orientation: Orientation;
  /**
   * All ship cells absolute coordinates in the board. Its size is larger than {@link ShipType.cellOffsets1} by 1.
   *
   * For example, 2-cell straight ship at `{ x: 3, y: 4 }` with {@link Orientation.Left} orientation would have it as `[{ x: 3, y: 4 }, { x: 4, y: 4 }]`.
   */
  shipCells: Point[];
}

export function createShips(shipTypes: DeepReadonly<ShipType[]>): Ship[] {
  const ships = [];
  let id = 0;
  for (const type of shipTypes) {
    for (let i = 0; i < type.shipCount; i += 1) {
      ships.push(createShip(type, id));
      id += 1;
    }
  }
  return ships;
}

export function createShip(shipType: DeepReadonly<ShipType>, id = 0): Ship {
  return {
    id,
    status: ShipStatus.Afloat,
    shipTypeId: shipType.id,
    orientation: defaultOrientation,
    shipCells: [],
  };
}
