import { iterate } from 'iterare';
import { cloneDeep } from 'lodash-es';
import { assert } from '../app/lib';
import { GuardedMap } from '../app/map';
import {
  addPoint,
  decodePoint,
  DeepReadonly,
  encodePoint,
  Point,
  subtractPoint,
  t,
} from '../app/types';
import { PlayerState } from '../features/game/gameSlice';
import { MessageId } from '../intl';

export enum GameStatus {
  Starting = 'starting',
  Configuring = 'configuring',
  Playing = 'playing',
  Finished = 'finished',
}

export interface Turn {
  /**
   * Cell shoots during turn in ascending order for each {@link PlayerIndex}.
   */
  cells: [Point[], Point[]];
}

/**
 * Turn history sorted in ascending order.
 */
export type TurnHistory = Turn[];

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
  return Array(size.x)
    .fill(null)
    .map(() =>
      Array(size.y)
        .fill(null)
        .map(() => createBoardCell())
    );
}

export enum Direction {
  Left = 'left',
  Bottom = 'bottom',
  Right = 'right',
  Top = 'top',
}

export const directionOrder: ReadonlyArray<Direction> = Object.values(Direction);

export const defaultDirection = directionOrder[0];

export function tryPushFromEdges(points: DeepReadonly<Point[]>, boardSize = defaultBoardSize) {
  const pushOffsets = new GuardedMap<Direction, number>(
    iterate(directionOrder).map((d) => t(d, 0))
  );
  for (const point of points) {
    if (point.x < 0) {
      pushOffsets.set(Direction.Left, Math.max(pushOffsets.get(Direction.Left), -point.x));
    } else if (point.x >= boardSize.x) {
      pushOffsets.set(
        Direction.Right,
        Math.min(pushOffsets.get(Direction.Right), -point.x + boardSize.x - 1)
      );
    }
    if (point.y < 0) {
      pushOffsets.set(Direction.Top, Math.max(pushOffsets.get(Direction.Top), -point.y));
    } else if (point.y >= boardSize.y) {
      pushOffsets.set(
        Direction.Bottom,
        Math.min(pushOffsets.get(Direction.Bottom), -point.y + boardSize.y - 1)
      );
    }
  }
  const offsetPoint: Point = { x: 0, y: 0 };
  for (const [direction, offset] of pushOffsets) {
    switch (direction) {
      case Direction.Left:
      case Direction.Right: {
        if (offset !== 0) {
          assert(offsetPoint.x === 0, 'The points do not fit horizontally!');
          offsetPoint.x = offset;
        }
        break;
      }
      case Direction.Top:
      case Direction.Bottom: {
        if (offset !== 0) {
          assert(offsetPoint.y === 0, 'The points do not fit vertically!');
          offsetPoint.y = offset;
        }
        break;
      }
    }
  }
  return applyOffset(offsetPoint, points, false);
}

/**
 * https://youtu.be/o3uJCCa5w2A
 * @param {DeepReadonly<Point[]>} points
 * @param {Direction} from
 * @param {Direction} to
 * @returns {Point[]}
 */
export function rotatePoints(
  points: DeepReadonly<Point[]>,
  from: Direction,
  to: Direction
): Point[] {
  const newPoints = cloneDeep(points) as Point[];
  const fromI = directionOrder.indexOf(from);
  const toI = directionOrder.indexOf(to);
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

export interface PointsBoundingRectangle {
  topLeft: Point;
  bottomRight: Point;
}

export function getBoundingRectangle(points: DeepReadonly<Point[]>): PointsBoundingRectangle {
  assert(points.length > 0, 'No points to calculate bounding rectangle!');
  const rectangle: PointsBoundingRectangle = {
    topLeft: { x: Number.MAX_SAFE_INTEGER, y: Number.MAX_SAFE_INTEGER },
    bottomRight: { x: Number.MIN_SAFE_INTEGER, y: Number.MIN_SAFE_INTEGER },
  };
  for (const p of points) {
    rectangle.topLeft.x = Math.min(p.x, rectangle.topLeft.x);
    rectangle.topLeft.y = Math.min(p.y, rectangle.topLeft.y);
    rectangle.bottomRight.x = Math.max(p.x, rectangle.bottomRight.x);
    rectangle.bottomRight.y = Math.max(p.y, rectangle.bottomRight.y);
  }
  return rectangle;
}

export function normalizeBoundingRectangle(
  rectangle: DeepReadonly<PointsBoundingRectangle>
): Point {
  return addPoint(subtractPoint(rectangle.bottomRight, rectangle.topLeft), { x: 1, y: 1 });
}

export interface ShipType {
  id: number;
  name: MessageId;
  /**
   * Offsets of ship cells, except the first one (it's always `{ x: 0, y: 0 }`). One-cell chips will have it empty.
   *
   * For example, 2-cell straight ship in {@link Direction.Left} direction would have it as `[{ x: 1, y: 0 }]`.
   */
  cellOffsets1: Point[];
  /**
   * Number of ships per player per game.
   */
  shipCount: number;
}

export function applyOffset(
  offset: DeepReadonly<Point>,
  points: DeepReadonly<Point[]>,
  includeInitial = true
): Point[] {
  const newPoints = includeInitial ? [cloneDeep(offset) as Point] : [];
  for (const point of points) {
    newPoints.push(addPoint(offset, point));
  }
  return newPoints;
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
  direction: Direction;
  /**
   * All ship cells absolute coordinates in the board. Its size is larger than {@link ShipType.cellOffsets1} by 1.
   *
   * For example, 2-cell straight ship at `{ x: 3, y: 4 }` with {@link Direction.Left} direction would have it as `[{ x: 3, y: 4 }, { x: 4, y: 4 }]`.
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
    direction: defaultDirection,
    shipCells: [],
  };
}

export function hasShipsInstalled(gamePlayer: DeepReadonly<PlayerState>) {
  // return gamePlayer.ships.length === shipCountForPlayer;
  return gamePlayer.ships.every((s) => s.shipCells.length > 0);
}
