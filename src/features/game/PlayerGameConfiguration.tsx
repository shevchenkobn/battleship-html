import DeleteIcon from '@mui/icons-material/Delete';
import UndoIcon from '@mui/icons-material/Undo';
import { Fab, Stack, Tooltip } from '@mui/material';
import { iterate } from 'iterare';
import { cloneDeep } from 'lodash-es';
import React, { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { normalizeToLimit } from '../../app/lib';
import {
  arraysUnorderedEqual,
  assert,
  assertUnreachable,
  DeepReadonly,
  encodePoint,
  Point,
  t,
} from '../../app/types';
import { MessageId } from '../../app/intl';
import { withRerenderErrorBoundary } from '../../components/withRerenderErrorBoundary';
import {
  applyOffset,
  areBoardsEqual,
  areShipsEqual,
  areShipTypesEqual,
  Board,
  cloneShip,
  defaultDirection,
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
import { useGameColors, useShipMap, useShipTypeMap } from './hooks';
import { getShipTypeCountMap } from './lib';
import { PlayerGame } from './PlayerGame';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import RotateRightIcon from '@mui/icons-material/RotateRight';

export interface PlayerGameConfigurationProps extends Callbacks {
  /**
   * An optional value to force rerender.
   */
  id?: any;
  board: DeepReadonly<Board>;
  ships: DeepReadonly<Ship[]>;
  shipTypes: DeepReadonly<ShipType[]>;
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
    shipNewPosition: ShipPlaceData | null;
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

(window as any).states = new Set();

function arePropsEqual(
  lastProps: DeepReadonly<PlayerGameConfigurationProps>,
  props: DeepReadonly<PlayerGameConfigurationProps>
) {
  return (
    lastProps.id === props.id &&
    areBoardsEqual(lastProps.board, props.board) &&
    arraysUnorderedEqual(lastProps.shipTypes, props.shipTypes, areShipTypesEqual) &&
    arraysUnorderedEqual(lastProps.ships, props.ships, areShipsEqual) &&
    lastProps.onShipAdd === props.onShipAdd &&
    lastProps.onShipReplace === props.onShipReplace &&
    lastProps.onShipRemove === props.onShipRemove
  );
}

const Component = (props: PlayerGameConfigurationProps) => {
  const { id, board, shipTypes, ships, onShipAdd, onShipReplace, onShipRemove } = props;

  const [_lastProps, _setLastProps] = useState(props);
  const propsChanged = !arePropsEqual(_lastProps, props);
  if (propsChanged) {
    _setLastProps(props);
  }

  const boardSize = useMemo(() => getBoardSize(board), [board]);

  const shipMap = useShipMap(ships);
  const [
    /**
     * A map of encoded ship cells to IDs.
     */ shipCellsToIds,
    setShipCellsToIds,
  ] = useState(new Map<string, number>());
  const [
    /**
     * A set of encoded ship & surrounding cells.
     */ occupiedCells,
    setOccupiedCells,
  ] = useState(new Set<string>());
  const recalculateOccupiedCells = useCallback(
    (excludeShipId?: number) => {
      const shipCells = new Map<string, number>();
      const cells = new Set<string>();
      for (const ship of ships) {
        if (ship.shipId === excludeShipId) {
          continue;
        }
        for (const cell of iterate(ship.shipCells).map(encodePoint)) {
          shipCells.set(cell, ship.shipId);
          cells.add(cell);
        }
        for (const cell of iterate(getSurroundingCells(ship.shipCells, boardSize)).map(
          encodePoint
        )) {
          cells.add(cell);
        }
      }
      setShipCellsToIds(shipCells);
      setOccupiedCells(cells);
      return cells;
    },
    [boardSize, ships]
  );
  useEffect(() => {
    recalculateOccupiedCells();
  }, [recalculateOccupiedCells]);

  const shipTypeMap = useShipTypeMap(shipTypes);
  const shipCountByType = useMemo(() => {
    const countMap = getShipTypeCountMap(shipTypes);
    for (const ship of ships) {
      countMap[ship.shipTypeId] -= 1;
    }
    return countMap;
  }, [shipTypes, ships]);
  // const [shipCountByType, setShipCountByType] = useState(_shipCountByType);
  // useEffect(() => setShipCountByType(_shipCountByType), [_shipCountByType, setShipCountByType]);

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
      /**
       * It is required because useReducer can be called more than once: https://github.com/facebook/react/issues/16295
       * My reducer is pure, but since it has an external side effect - callback from props.
       * So, pure reducer and side effect, which depends on this reducer causes infinite rendering: https://reactjs.org/docs/error-decoder.html/?invariant=185
       */
      if (propsChanged) {
        return createIdleState();
      }
      switch (action.type) {
        case ShipStateActionType.SelectShipForAdding: {
          if (
            isKind(state, ShipStateKind.Adding) &&
            action.shipTypeId === state.shipType.shipTypeId
          ) {
            return createIdleState();
          }
          assert(shipCountByType[action.shipTypeId] > 0, 'No ship type to select!');
          const shipType = shipTypeMap.get(action.shipTypeId);
          return {
            ...state,
            kind: ShipStateKind.Adding,
            shipType,
            direction: defaultDirection,
            shipNewPosition: null,
          };
        }
        case ShipStateActionType.SelectPlacedShip: {
          if (isKind(state, ShipStateKind.Adjusting) && action.shipId === state.ship.shipId) {
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
              cells = state.shipNewPosition?.cells;
              shipType = state.shipType;
              direction = state.direction;
              break;
            }
            case ShipStateKind.Adjusting: {
              cells = state.shipNewPosition?.cells;
              shipType = shipTypeMap.get(state.ship.shipTypeId);
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
                newState.shipNewPosition = position;
              }
              return { ...state, direction: newDirection, shipNewPosition: position };
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
                shipNewPosition: action.position
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
              shipTypeId = state.shipType.shipTypeId;
              direction = state.direction;
              break;
            }
            case ShipStateKind.Adjusting: {
              shipTypeId = state.ship.shipTypeId;
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

          return { kind: ShipStateKind.Removed, shipId: state.ship.shipId };
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
    [getShipPosition, propsChanged, recalculateOccupiedCells, shipCountByType, shipMap, shipTypeMap]
  );
  const [shipState, dispatch] = useReducer(reducer, createIdleState());
  useEffect(() => {
    if (
      isKind(shipState, ShipStateKind.Added) ||
      isKind(shipState, ShipStateKind.Replaced) ||
      isKind(shipState, ShipStateKind.Removed)
    ) {
      (window as any).states.add(shipState);
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
  useEffect(() => {
    dispatch({ type: ShipStateActionType.Reset });
  }, [id]);

  const colors = useGameColors();
  const cellStyles = useMemo(() => {
    const cellStyles: Map<string, CellStyle> = iterate(occupiedCells)
      .map((c) => t(c, getCellStyle(colors.surroundingShipWater)))
      .toMap();
    for (const ship of ships) {
      for (const cell of ship.shipCells) {
        cellStyles.set(encodePoint(cell), getCellStyle(colors.boardShip, cellHoverableStyle));
      }
    }
    let place: DeepReadonly<ShipPlaceData> | null = null;
    switch (shipState.kind) {
      case ShipStateKind.Adding: {
        place = shipState.shipNewPosition;
        break;
      }
      case ShipStateKind.Adjusting: {
        for (const cell of shipState.ship.shipCells) {
          cellStyles.set(encodePoint(cell), getCellStyle(colors.selectedShip));
        }
        place = shipState.shipNewPosition;
        break;
      }
    }
    if (place) {
      const color = place.canPlace ? colors.placingShip : colors.shipHit;
      for (const cell of place.cells) {
        cellStyles.set(encodePoint(cell), getCellStyle(color));
      }
    }
    return cellStyles;
    // TODO: not a todo. Remove the line temporarily below to make sure the `deps` are correct.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    occupiedCells,
    shipState.kind,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    (shipState as ShipStateMap[ShipStateKind.Adjusting])?.ship?.shipCells,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    (shipState as ShipStateMap[ShipStateKind.Adding]).shipNewPosition,
    colors.surroundingShipWater,
    colors.placingShip,
    colors.boardShip,
    colors.selectedShip,
    colors.shipHit,
    ships,
  ]);

  const boardCommonCellStyle: CellStyle | undefined = useMemo(
    () =>
      (isKind(shipState, ShipStateKind.Adding) || isKind(shipState, ShipStateKind.Adjusting)) &&
      (shipState.shipNewPosition && !shipState.shipNewPosition.canPlace
        ? { cursor: 'not-allowed' }
        : cellHoverableStyle),
    [shipState]
  );
  return (
    <PlayerGame
      boardSize={boardSize}
      shipTypes={shipTypes}
      boardCommonCellStyle={boardCommonCellStyle}
      boardStyle={{ className: 'm-auto' }}
      boardCellStyles={cellStyles}
      boardInteraction={
        isKind(shipState, ShipStateKind.Adding) || isKind(shipState, ShipStateKind.Adjusting)
          ? {
              cellHoverStyle: {},
              onCellHoverChange(cell: Point, isHovering: boolean) {
                dispatch({
                  type: ShipStateActionType.HoverShipOnBoard,
                  position: isHovering ? cell : null,
                });
              },
              onCellClick(cell) {
                dispatch({ type: ShipStateActionType.PlaceShip, position: cell });
              },
            }
          : ships.length > 0
          ? {
              cellHoverStyle: {},
              onCellClick(cell: Point) {
                const shipId = shipCellsToIds.get(encodePoint(cell));
                // noinspection SuspiciousTypeOfGuard
                if (typeof shipId === 'number') {
                  dispatch({ type: ShipStateActionType.SelectPlacedShip, shipId });
                }
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
          ? shipState.shipType.shipTypeId
          : undefined,
        beforeChildren: (
          <Stack direction="row" spacing={1}>
            <Tooltip title={<FormattedMessage id={MessageId.CancelAction} />}>
              <span>
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
              </span>
            </Tooltip>
            <Tooltip title={<FormattedMessage id={MessageId.RotateCounterClockwiseAction} />}>
              <span>
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
                          dispatch({
                            type: ShipStateActionType.RotateShip,
                            directionIndexOffset: -1,
                          })
                      : undefined
                  }
                >
                  <RotateLeftIcon />
                </Fab>
              </span>
            </Tooltip>
            <Tooltip title={<FormattedMessage id={MessageId.RotateClockwiseAction} />}>
              <span>
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
                          dispatch({
                            type: ShipStateActionType.RotateShip,
                            directionIndexOffset: 1,
                          })
                      : undefined
                  }
                >
                  <RotateRightIcon />
                </Fab>
              </span>
            </Tooltip>
            <Tooltip title={<FormattedMessage id={MessageId.RemoveAction} />}>
              <span>
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
              </span>
            </Tooltip>
          </Stack>
        ),
      }}
    />
  );
};
/**
 * Catches errors "Maximum update depth exceeded." and "Minified React error #185" thanks to React on mobile for no good reason 🤔
 * @type {React.ComponentClass<PlayerGameConfigurationProps> | React.FunctionComponent<PlayerGameConfigurationProps>}
 */
export const PlayerGameConfiguration = withRerenderErrorBoundary(Component);

function getCellStyle(color: string, baseStyle: CellStyle = {}): CellStyle {
  return {
    ...baseStyle,
    backgroundColor: color,
  };
}
