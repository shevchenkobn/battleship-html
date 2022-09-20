import { iterate } from 'iterare';
import { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { normalizeToLimit } from '../../app/lib';
import { assert, assertUnreachable, DeepReadonly, encodePoint, Point, t } from '../../app/types';
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

export interface PlayerGameConfigurationProps {
  board: DeepReadonly<Board>;
  ships: DeepReadonly<Ship[]>;
  /**
   * Data sync argument MUST be guaranteed by the component.
   * @param {DeepReadonly<ShipType>} shipType
   * @param {Direction} direction
   * @param {Ship["shipCells"]} shipCells
   */
  onShipAdded(
    shipType: DeepReadonly<ShipType>,
    direction: Direction,
    shipCells: Ship['shipCells']
  ): void;
  onShipReplace(shipId: number, ship: Ship): void;
  onShipRemove(shipId: number): void;
  shipTypes: DeepReadonly<ShipType[]>;
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
  onShipAdded,
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
        for (const cell in iterate(ship.shipCells)
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

  const _shipCountByType = useMemo(() => {
    const countMap = getShipTypeCountMap(shipTypes);
    for (const ship of ships) {
      countMap[ship.id] -= 1;
    }
    return countMap;
  }, [shipTypes, ships]);
  const [shipCountByType, setShipCountByType] = useState(_shipCountByType);
  useEffect(() => setShipCountByType(_shipCountByType), [_shipCountByType, setShipCountByType]);
  const shipTypeMap = useShipEntityMap(shipTypes);

  const getShipPosition = useCallback(
    (position: DeepReadonly<Point>, shipCellOffsets1: DeepReadonly<Point[]>) => {
      const ship: ShipPlaceData = {
        cells: tryPushFromEdges(applyOffset(position, shipCellOffsets1), boardSize),
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
          assertKind(state, ShipStateKind.Idle);
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
          assertKind(state, ShipStateKind.Idle);
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
          switch (state.kind) {
            case ShipStateKind.Adding: {
              cells = state.ship?.cells;
              shipType = state.shipType;
              break;
            }
            case ShipStateKind.Adjusting: {
              cells = state.shipNewPosition?.cells;
              shipType = shipTypeMap.get(state.ship.id);
              break;
            }
            default: {
              assertUnreachable();
            }
          }

          const newIndex = normalizeToLimit(
            defaultDirectionIndex +
              directionOrder.length +
              normalizeToLimit(action.directionIndexOffset, directionOrder.length),
            directionOrder.length
          );
          if (newIndex === defaultDirectionIndex) {
            return state;
          }
          const newDirection = directionOrder[newIndex];

          let position: ShipPlaceData | null = null;
          if (cells) {
            const cellOffsets1 = rotatePoints(
              shipType.cellOffsets1,
              defaultDirection,
              newDirection
            );
            position = getShipPosition(cells[0], cellOffsets1);
          }

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
                  ? getShipPosition(action.position, state.shipType.cellOffsets1)
                  : null,
              };
            }
            case ShipStateKind.Adjusting: {
              return {
                ...state,
                shipNewPosition: action.position
                  ? getShipPosition(
                      action.position,
                      shipTypeMap.get(state.ship.shipTypeId).cellOffsets1
                    )
                  : null,
              };
            }
          }
          break;
        }
        case ShipStateActionType.PlaceShip: {
          let shipTypeId: number;
          switch (state.kind) {
            case ShipStateKind.Adding: {
              shipTypeId = state.shipType.id;
              break;
            }
            case ShipStateKind.Adjusting: {
              shipTypeId = state.ship.id;
              break;
            }
            default: {
              assertUnreachable();
            }
          }
          const position = getShipPosition(
            action.position,
            shipTypeMap.get(shipTypeId).cellOffsets1
          );
          if (!position.canPlace) {
            console.warn('Unexpectedly cannot place the ship, returning.');
            return state;
          }

          switch (state.kind) {
            case ShipStateKind.Adding: {
              onShipAdded(state.shipType, state.direction, position.cells);
              // setShipCountByType({
              //   ...shipCountByType,
              //   [state.shipType.id]: shipCountByType[state.shipType.id] - 1,
              // });
              break;
            }
            case ShipStateKind.Adjusting: {
              const ship = cloneShip(state.ship);
              ship.shipCells = position.cells;
              onShipReplace(ship.id, ship);
              recalculateOccupiedCells();
              break;
            }
            default: {
              assertUnreachable();
            }
          }

          return createIdleState();
        }
        case ShipStateActionType.RemoveShip: {
          assertKind(state, ShipStateKind.Adjusting);

          onShipRemove(state.ship.id);
          // setShipCountByType({
          //   ...shipCountByType,
          //   [shipType.id]: shipCountByType[shipType.id] + 1,
          // });

          return createIdleState();
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
    [
      getShipPosition,
      onShipAdded,
      onShipRemove,
      onShipReplace,
      recalculateOccupiedCells,
      shipMap,
      shipTypeMap,
    ]
  );
  const [shipState, dispatch] = useReducer(reducer, createIdleState());

  const colors = useGameColors();
  const cellStyles = useMemo(() => {
    const cellStyles = iterate(occupiedCells)
      .map((c) => t(c, colors.surroundingShipWater))
      .toMap();
    for (const ship of ships) {
      for (const cell of ship.shipCells) {
        cellStyles.set(encodePoint(cell), colors.boardShip);
      }
    }
    switch (shipState.kind) {
      case ShipStateKind.Adding: {
        if (shipState.ship) {
          const color = shipState.ship.canPlace ? colors.selectedShip : colors.shipHit;
          for (const cell of shipState.ship.cells) {
            cellStyles.set(encodePoint(cell), color);
          }
        }
        break;
      }
      case ShipStateKind.Adjusting: {
        for (const cell of shipState.ship.shipCells) {
          cellStyles.set(encodePoint(cell), colors.selectedShip);
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
      }}
    />
  );
}
