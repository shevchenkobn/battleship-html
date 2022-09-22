import DeleteIcon from '@mui/icons-material/Delete';
import UndoIcon from '@mui/icons-material/Undo';
import { Fab, Stack } from '@mui/material';
import { iterate } from 'iterare';
import { cloneDeep } from 'lodash-es';
import React, { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { normalizeToLimit } from '../../app/lib';
import {
  asReadonly,
  assert,
  assertUnreachable,
  DeepReadonly,
  encodePoint,
  Point,
  t,
} from '../../app/types';
import {
  applyOffset,
  Board,
  cloneShip,
  defaultDirection,
  defaultDirectionIndex,
  Direction,
  directionOrder,
  getBoardSize,
  getSurroundingCells,
  rotatePoints,
  Ship,
  ShipType,
  tryPushFromEdges,
} from '../../models/game';
import { CellStyle } from './CellGrid';
import { useGameColors, useShipEntityMap } from './hooks';
import { getShipTypeCountMap } from './lib';
import { PlayerGame } from './PlayerGame';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import RotateRightIcon from '@mui/icons-material/RotateRight';

export interface PlayerGameConfigurationProps extends Callbacks {
  board: DeepReadonly<Board>;
  ships: DeepReadonly<Ship[]>;
  shipTypes: DeepReadonly<ShipType[]>;
  // onShipsUpdate(ships: Ship[]): void;
  /**
   * Data sync argument MUST be guaranteed by the component.
   * @param {DeepReadonly<ShipType>} shipType
   * @param {Direction} direction
   * @param {Ship["shipCells"]} shipCells
   */
  onShipAdd(
    shipType: DeepReadonly<ShipType>,
    direction: Direction,
    shipCells: Ship['shipCells']
  ): void;
  onShipReplace(ship: Ship): void;
  onShipRemove(shipId: number): void;
}

interface Callbacks {
  onShipAdd(
    shipType: DeepReadonly<ShipType>,
    direction: Direction,
    shipCells: Ship['shipCells']
  ): void;
  onShipReplace(ship: Ship): void;
  onShipRemove(shipId: number): void;
}

enum ShipStateKind {
  Idle = 'idle',
  /**
   * Setting the ship from types.
   * @type {ShipState.SettingShip}
   */
  Adding = 'addingShip',
  /**
   * Updating or deleting the ship from the board.
   * @type {ShipState.SettingShip}
   */
  Adjusting = 'adjustingShip',

  Added = 'addedShip',
  Replaced = 'replacedShip',
  Removed = 'removedShip',
}

interface ShipPlaceData {
  cells: Point[];
  canPlace: boolean;
}

type ShipState = DeepReadonly<ShipStateMap[ShipStateKind]>;
interface ShipStateMap {
  [ShipStateKind.Idle]: {
    kind: ShipStateKind.Idle;
  };
  [ShipStateKind.Adding]: {
    kind: ShipStateKind.Adding;
    shipType: ShipType;
    direction: Direction;
    ship: ShipPlaceData | null;
  };
  [ShipStateKind.Adjusting]: {
    kind: ShipStateKind.Adjusting;
    ship: Ship;
    shipNewPosition: ShipPlaceData | null;
  };
  [ShipStateKind.Added]: {
    kind: ShipStateKind.Added;
    shipType: DeepReadonly<ShipType>;
    direction: Direction;
    shipCells: Ship['shipCells'];
  };
  [ShipStateKind.Replaced]: {
    kind: ShipStateKind.Replaced;
    ship: Ship;
  };
  [ShipStateKind.Removed]: {
    kind: ShipStateKind.Removed;
    shipId: number;
  };
}

function createIdleState(): ShipStateMap[ShipStateKind.Idle] {
  return { kind: ShipStateKind.Idle };
}

function assertKind<K extends ShipStateKind, T extends ShipStateMap[K]>(
  state: ShipState,
  kind: K
): asserts state is T {
  assert(isKind(state, kind), `State is not of "${kind} kind!`);
}

function isKind<K extends ShipStateKind, T extends ShipStateMap[K]>(
  state: ShipState,
  kind: K
): state is T {
  return state.kind === kind;
}

function formatInvalidStateMessage(kind: ShipStateKind, action: ShipStateActionType) {
  return `Invalid action "${action}" for state "${kind}"!`;
}

enum ShipStateActionType {
  SelectShipForAdding = 'selectShipForAdding',
  SelectPlacedShip = 'selectPlacedShip',
  RotateShip = 'rotateShip',
  HoverShipOnBoard = 'hoverShipOnBoard',
  PlaceShip = 'placeShip',
  RemoveShip = 'removeShip',
  Reset = 'reset',
}

type ShipStateAction = DeepReadonly<
  | {
      type: ShipStateActionType.SelectShipForAdding;
      shipTypeId: number;
    }
  | {
      type: ShipStateActionType.SelectPlacedShip;
      shipId: number;
    }
  | {
      type: ShipStateActionType.RotateShip;
      /**
       * Direction index offset to be used with {@link directionOrder}.
       */
      directionIndexOffset: number;
    }
  | { type: ShipStateActionType.HoverShipOnBoard; position: Point | null }
  | { type: ShipStateActionType.PlaceShip; position: Point }
  | { type: ShipStateActionType.RemoveShip }
  | { type: ShipStateActionType.Reset }
>;

const cellHoverableStyle: CellStyle = {
  cursor: 'pointer',
};

export function PlayerGameConfiguration({
  board,
  shipTypes,
  ships,
  onShipAdd,
  onShipReplace,
  onShipRemove,
}: PlayerGameConfigurationProps) {
  const boardSize = useMemo(() => getBoardSize(board), [board]);

  const shipMap = useShipEntityMap(ships);
  const [
    /**
     * A set of encoded occupied points.
     */ occupiedCells,
    setOccupiedCells,
  ] = useState(new Set<string>());
  const recalculateOccupiedCells = useCallback(
    (excludeShipId?: number) => {
      const points = new Set<string>();
      for (const ship of ships) {
        if (ship.id === excludeShipId) {
          continue;
        }
        for (const cell of iterate(ship.shipCells)
          .concat(getSurroundingCells(ship.shipCells, boardSize))
          .map(encodePoint)) {
          points.add(cell);
        }
      }
      setOccupiedCells(points);
      return points;
    },
    [boardSize, ships]
  );
  useEffect(() => {
    recalculateOccupiedCells();
  }, [recalculateOccupiedCells]);

  const shipCountByType = useMemo(() => {
    const countMap = getShipTypeCountMap(shipTypes);
    for (const ship of ships) {
      countMap[ship.id] -= 1;
    }
    return countMap;
  }, [shipTypes, ships]);
  // const [shipCountByType, setShipCountByType] = useState(_shipCountByType);
  // useEffect(() => setShipCountByType(_shipCountByType), [_shipCountByType, setShipCountByType]);
  const shipTypeMap = useShipEntityMap(shipTypes);

  const getShipPosition = useCallback(
    (
      position: DeepReadonly<Point>,
      shipCellOffsets1: DeepReadonly<Point[]>,
      direction: Direction
    ) => {
      const ship: ShipPlaceData = {
        cells: tryPushFromEdges(
          applyOffset(position, rotatePoints(shipCellOffsets1, defaultDirection, direction)),
          boardSize
        ),
        canPlace: true,
      };
      for (const cell of ship.cells) {
        if (occupiedCells.has(encodePoint(cell))) {
          ship.canPlace = false;
          break;
        }
      }
      return ship;
    },
    [occupiedCells, boardSize]
  );
  const reducer = useCallback(
    (state: ShipState, action: ShipStateAction): ShipState => {
      switch (action.type) {
        case ShipStateActionType.SelectShipForAdding: {
          if (isKind(state, ShipStateKind.Adding) && action.shipTypeId === state.shipType.id) {
            return createIdleState();
          }
          assert(shipCountByType[action.shipTypeId] > 0, 'No ship type to select!');
          const shipType = shipTypeMap.get(action.shipTypeId);
          return {
            ...state,
            kind: ShipStateKind.Adding,
            shipType,
            direction: defaultDirection,
            ship: null,
          };
        }
        case ShipStateActionType.SelectPlacedShip: {
          if (isKind(state, ShipStateKind.Adjusting) && action.shipId === state.ship.id) {
            return createIdleState();
          }
          const ship = shipMap.get(action.shipId);
          recalculateOccupiedCells(action.shipId);
          return { kind: ShipStateKind.Adjusting, ship, shipNewPosition: null };
        }
        case ShipStateActionType.RotateShip: {
          assert(
            state.kind === ShipStateKind.Adding || state.kind === ShipStateKind.Adjusting,
            formatInvalidStateMessage(state.kind, action.type)
          );

          let cells: DeepReadonly<Point[]> | undefined;
          let shipType: DeepReadonly<ShipType>;
          let direction: Direction;
          switch (state.kind) {
            case ShipStateKind.Adding: {
              cells = state.ship?.cells;
              shipType = state.shipType;
              direction = state.direction;
              break;
            }
            case ShipStateKind.Adjusting: {
              cells = state.shipNewPosition?.cells;
              shipType = shipTypeMap.get(state.ship.id);
              direction = state.ship.direction;
              break;
            }
            default: {
              assertUnreachable();
            }
          }

          const index = directionOrder.indexOf(direction);
          assert(index >= 0, 'Unknown direction!');
          const newIndex = normalizeToLimit(
            index +
              directionOrder.length +
              normalizeToLimit(action.directionIndexOffset, directionOrder.length),
            directionOrder.length
          );
          const newDirection = directionOrder[newIndex];

          const position: ShipPlaceData | null = cells
            ? getShipPosition(cells[0], shipType.cellOffsets1, newDirection)
            : null;

          switch (state.kind) {
            case ShipStateKind.Adding: {
              const newState = { ...state, direction: newDirection };
              if (position) {
                newState.ship = position;
              }
              return { ...state, direction: newDirection, ship: position };
            }
            case ShipStateKind.Adjusting: {
              const newShip = cloneShip(state.ship);
              newShip.direction = newDirection;
              return { ...state, ship: newShip, shipNewPosition: position };
            }
          }
          break;
        }
        case ShipStateActionType.HoverShipOnBoard: {
          assert(
            isKind(state, ShipStateKind.Adding) || isKind(state, ShipStateKind.Adjusting),
            formatInvalidStateMessage(state.kind, action.type)
          );
          switch (state.kind) {
            case ShipStateKind.Adding: {
              return {
                ...state,
                ship: action.position
                  ? getShipPosition(action.position, state.shipType.cellOffsets1, state.direction)
                  : null,
              };
            }
            case ShipStateKind.Adjusting: {
              return {
                ...state,
                shipNewPosition: action.position
                  ? getShipPosition(
                      action.position,
                      shipTypeMap.get(state.ship.shipTypeId).cellOffsets1,
                      state.ship.direction
                    )
                  : null,
              };
            }
          }
          break;
        }
        case ShipStateActionType.PlaceShip: {
          let shipTypeId: number;
          let direction: Direction;
          switch (state.kind) {
            case ShipStateKind.Adding: {
              shipTypeId = state.shipType.id;
              direction = state.direction;
              break;
            }
            case ShipStateKind.Adjusting: {
              shipTypeId = state.ship.id;
              direction = state.ship.direction;
              break;
            }
            default: {
              assertUnreachable();
            }
          }
          const position = getShipPosition(
            action.position,
            shipTypeMap.get(shipTypeId).cellOffsets1,
            direction
          );
          if (!position.canPlace) {
            console.warn('Unexpectedly cannot place the ship, returning.');
            return state;
          }

          switch (state.kind) {
            case ShipStateKind.Adding: {
              return {
                kind: ShipStateKind.Added,
                shipType: state.shipType,
                direction: state.direction,
                shipCells: position.cells,
              };
              // setShipCountByType({
              //   ...shipCountByType,
              //   [state.shipType.id]: shipCountByType[state.shipType.id] - 1,
              // });
            }
            case ShipStateKind.Adjusting: {
              const ship = cloneShip(state.ship);
              ship.shipCells = position.cells;
              return { kind: ShipStateKind.Replaced, ship };
              // recalculateOccupiedCells();
            }
            default: {
              assertUnreachable();
            }
          }
          break;
        }
        case ShipStateActionType.RemoveShip: {
          assertKind(state, ShipStateKind.Adjusting);

          return { kind: ShipStateKind.Removed, shipId: state.ship.id };
          // setShipCountByType({
          //   ...shipCountByType,
          //   [shipType.id]: shipCountByType[shipType.id] + 1,
          // });
        }
        case ShipStateActionType.Reset: {
          if (isKind(state, ShipStateKind.Adjusting)) {
            recalculateOccupiedCells();
          }
          return createIdleState();
        }
        default: {
          console.warn('Unknown action: ', (action as any).type);
          return state;
        }
      }
      assertUnreachable();
    },
    [getShipPosition, recalculateOccupiedCells, shipCountByType, shipMap, shipTypeMap]
  );
  const [shipState, dispatch] = useReducer(reducer, createIdleState());
  useEffect(() => {
    if (
      isKind(shipState, ShipStateKind.Added) ||
      isKind(shipState, ShipStateKind.Replaced) ||
      isKind(shipState, ShipStateKind.Removed)
    ) {
      switch (shipState.kind) {
        case ShipStateKind.Added: {
          onShipAdd(
            shipState.shipType,
            shipState.direction,
            cloneDeep(shipState.shipCells) as Point[]
          );
          break;
        }
        case ShipStateKind.Replaced: {
          onShipReplace(shipState.ship);
          break;
        }
        case ShipStateKind.Removed: {
          onShipRemove(shipState.shipId);
          break;
        }
      }
      dispatch({ type: ShipStateActionType.Reset });
    }
  }, [onShipAdd, onShipRemove, onShipReplace, shipState]);

  const colors = useGameColors();
  const cellStyles = useMemo(() => {
    const cellStyles: Map<string, CellStyle> = iterate(occupiedCells)
      .map((c) => t(c, getCellStyle(colors.surroundingShipWater)))
      .toMap();
    for (const ship of ships) {
      for (const cell of ship.shipCells) {
        cellStyles.set(encodePoint(cell), getCellStyle(colors.boardShip));
      }
    }
    switch (shipState.kind) {
      case ShipStateKind.Adding: {
        if (shipState.ship) {
          const color = shipState.ship.canPlace ? colors.selectedShip : colors.shipHit;
          for (const cell of shipState.ship.cells) {
            cellStyles.set(encodePoint(cell), getCellStyle(color));
          }
        }
        break;
      }
      case ShipStateKind.Adjusting: {
        for (const cell of shipState.ship.shipCells) {
          cellStyles.set(encodePoint(cell), getCellStyle(colors.selectedShip));
        }
        break;
      }
    }
    return cellStyles;
    // TODO: not a todo. Remove the line temporarily below to make sure the `deps` are correct.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    occupiedCells,
    shipState.kind,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    (shipState as any).ship,
    colors.surroundingShipWater,
    colors.boardShip,
    colors.selectedShip,
    colors.shipHit,
    ships,
  ]);

  return (
    <PlayerGame
      boardSize={boardSize}
      shipTypes={shipTypes}
      boardCommonCellStyle={
        (isKind(shipState, ShipStateKind.Adding) || isKind(shipState, ShipStateKind.Adjusting)) &&
        cellHoverableStyle
      }
      boardStyle={{ className: 'm-auto' }}
      boardCellStyles={cellStyles}
      boardInteraction={
        ships.length > 0
          ? {
              cellHoverStyle: cellHoverableStyle,
            }
          : isKind(shipState, ShipStateKind.Adding) || isKind(shipState, ShipStateKind.Adjusting)
          ? {
              cellHoverStyle: cellHoverableStyle,
              onCellHoverChange(cell: Point, isHovering: boolean) {
                dispatch({
                  type: ShipStateActionType.HoverShipOnBoard,
                  position: isHovering ? cell : null,
                });
              },
              onCellClick(cell: Point) {
                dispatch({ type: ShipStateActionType.PlaceShip, position: cell });
              },
            }
          : undefined
      }
      shipTypesProps={{
        onShipSelected(shipTypeId) {
          dispatch({ type: ShipStateActionType.SelectShipForAdding, shipTypeId });
        },
        shipCountByType,
        selectedShipTypeId: isKind(shipState, ShipStateKind.Adding)
          ? shipState.shipType.id
          : undefined,
        beforeChildren: (
          <Stack direction="row" spacing={1}>
            <Fab
              color="secondary"
              aria-label="back"
              disabled={
                !isKind(shipState, ShipStateKind.Adding) &&
                !isKind(shipState, ShipStateKind.Adjusting)
              }
              onClick={
                isKind(shipState, ShipStateKind.Adding) ||
                isKind(shipState, ShipStateKind.Adjusting)
                  ? () => dispatch({ type: ShipStateActionType.Reset })
                  : undefined
              }
            >
              <UndoIcon />
            </Fab>
            <Fab
              color="primary"
              aria-label="rotate-counterclockwise"
              disabled={
                !isKind(shipState, ShipStateKind.Adding) &&
                !isKind(shipState, ShipStateKind.Adjusting)
              }
              onClick={
                isKind(shipState, ShipStateKind.Adding) ||
                isKind(shipState, ShipStateKind.Adjusting)
                  ? () =>
                      dispatch({ type: ShipStateActionType.RotateShip, directionIndexOffset: -1 })
                  : undefined
              }
            >
              <RotateLeftIcon />
            </Fab>
            <Fab
              color="primary"
              aria-label="rotate-clockwise"
              disabled={
                !isKind(shipState, ShipStateKind.Adding) &&
                !isKind(shipState, ShipStateKind.Adjusting)
              }
              onClick={
                isKind(shipState, ShipStateKind.Adding) ||
                isKind(shipState, ShipStateKind.Adjusting)
                  ? () =>
                      dispatch({ type: ShipStateActionType.RotateShip, directionIndexOffset: 1 })
                  : undefined
              }
            >
              <RotateRightIcon />
            </Fab>
            <Fab
              color="primary"
              aria-label="remove"
              disabled={!isKind(shipState, ShipStateKind.Adjusting)}
              onClick={
                isKind(shipState, ShipStateKind.Adjusting)
                  ? () => dispatch({ type: ShipStateActionType.RemoveShip })
                  : undefined
              }
            >
              <DeleteIcon />
            </Fab>
          </Stack>
        ),
      }}
    />
  );
}

function getCellStyle(color: string) {
  return {
    backgroundColor: color,
  };
}
