import { Grid, Stack } from '@mui/material';
import Typography from '@mui/material/Typography';
import { iterate } from 'iterare';
import { useCallback, useMemo, useReducer, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { normalizeToLimit } from '../../app/lib';
import {
  assert,
  assertNotMaybe,
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
  createShip,
  defaultDirection,
  Direction,
  directionOrder,
  getSurroundingCells,
  rotatePoints,
  Ship,
  ShipType,
  tryPushFromEdges,
} from '../../models/game';
import { CellGrid, CellGridProps, CellStyle } from './CellGrid';
import { useCellSizePx, useGameColors, useShipEntityMap, useTypographyVariant } from './hooks';

export type PlayerGameProps = (
  | {
      boardSize: DeepReadonly<Point>;
    }
  | { interactiveBoard: DeepReadonly<Board>; getNewShipId: () => number }
) & {
  shipTypes: DeepReadonly<ShipType[]>;
};

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

const cellHoverStyle: CellStyle = {
  cursor: 'pointer',
};

export function PlayerGame(props: PlayerGameProps) {
  const shipTypes = props.shipTypes;
  const board = 'interactiveBoard' in props ? props.interactiveBoard : null;
  const getNewShipId = 'getNewShipId' in props ? props.getNewShipId : null;
  const boardSize = useMemo(() => {
    const boardSize =
      'boardSize' in props ? props.boardSize : board ? { x: board.length, y: board.length } : null;
    assertNotMaybe(boardSize, 'Either interactive board or board size must be present');
    return boardSize;
  }, [props, board]);

  const mappedShipCount = useMemo(
    () => Object.fromEntries(iterate(shipTypes).map((type) => t(type.id, type.shipCount))),
    [shipTypes]
  );
  const [shipCountByType, setShipCountByType] = useState(mappedShipCount);
  const shipTypeMap = useShipEntityMap(shipTypes);

  const colors = useGameColors();
  const [
    /**
     * A set of encoded occupied points.
     */ occupiedCells,
    setOccupiedCells,
  ] = useState(new Set<string>());
  const [ships, setShips] = useState([] as Ship[]);
  const shipMap = useShipEntityMap(ships);
  /**
   * Make sure after updating ships.
   * @type {() => void}
   */
  const updateOccupiedCells = useCallback(() => {
    const points = new Set<string>();
    for (const ship of ships) {
      for (const cell in iterate(ship.shipCells)
        .concat(getSurroundingCells(ship.shipCells, boardSize))
        .map(encodePoint)) {
        points.add(cell);
      }
    }
    setOccupiedCells(points);
  }, [boardSize, ships]);

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
  const reducer = useMemo(
    () =>
      board
        ? (state: ShipState, action: ShipStateAction): ShipState => {
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
                return { kind: ShipStateKind.Adjusting, ship, shipNewPosition: null };
              }
              case ShipStateActionType.RotateShip: {
                assert(
                  state.kind === ShipStateKind.Adding || state.kind === ShipStateKind.Adjusting,
                  formatInvalidStateMessage(state.kind, action.type)
                );

                let cells: DeepReadonly<Point[]> | undefined;
                let direction: Direction;
                let shipType: DeepReadonly<ShipType>;
                switch (state.kind) {
                  case ShipStateKind.Adding: {
                    cells = state.ship?.cells;
                    direction = state.direction;
                    shipType = state.shipType;
                    break;
                  }
                  case ShipStateKind.Adjusting: {
                    cells = state.shipNewPosition?.cells;
                    direction = state.ship.direction;
                    shipType = shipTypeMap.get(state.ship.id);
                    break;
                  }
                  default: {
                    assertUnreachable();
                  }
                }

                const index = directionOrder.indexOf(direction);
                const newIndex = normalizeToLimit(
                  index +
                    directionOrder.length +
                    normalizeToLimit(action.directionIndexOffset, directionOrder.length),
                  directionOrder.length
                );
                if (index === newIndex) {
                  return state;
                }
                const newDirection = directionOrder[newIndex];

                let position: ShipPlaceData | null = null;
                if (cells) {
                  const cellOffsets1 = rotatePoints(shipType.cellOffsets1, direction, newDirection);
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
                let ship: Ship;
                let newShips: Ship[];
                switch (state.kind) {
                  case ShipStateKind.Adding: {
                    assertNotMaybe(getNewShipId);
                    ship = createShip(state.shipType, state.direction, getNewShipId());
                    setShipCountByType({
                      ...shipCountByType,
                      [ship.shipTypeId]: shipCountByType[ship.shipTypeId] - 1,
                    });
                    newShips = [...ships, ship];
                    break;
                  }
                  case ShipStateKind.Adjusting: {
                    ship = cloneShip(state.ship);
                    newShips = ships.slice();
                    const index = ships.findIndex((s) => s.id === ship.id);
                    assert(index >= 0, 'Unknown ship is updated!');
                    newShips.splice(index, 1, ship);
                    break;
                  }
                  default: {
                    assertUnreachable();
                  }
                }
                const position = getShipPosition(
                  action.position,
                  shipTypeMap.get(ship.shipTypeId).cellOffsets1
                );
                if (!position.canPlace) {
                  console.warn('Unexpectedly cannot place the ship, returning.');
                  return state;
                }

                ship.shipCells = position.cells;
                setShips(newShips);
                updateOccupiedCells();

                return createIdleState();
              }
              case ShipStateActionType.RemoveShip: {
                assertKind(state, ShipStateKind.Adjusting);
                const newShips = ships.filter((s) => s.id !== state.ship.id);
                assert(newShips.length === ships.length, 'An attempt to delete an unknown ship!');

                const shipType = shipTypeMap.get(state.ship.id);
                setShips(newShips);
                setShipCountByType({
                  ...shipCountByType,
                  [shipType.id]: shipCountByType[shipType.id] + 1,
                });
                updateOccupiedCells();

                return createIdleState();
              }
              case ShipStateActionType.Reset: {
                return createIdleState();
              }
              default: {
                console.warn('Unknown action: ', (action as any).type);
                return state;
              }
            }
            assertUnreachable();
          }
        : createIdleState,
    [
      board,
      getNewShipId,
      getShipPosition,
      shipCountByType,
      shipMap,
      shipTypeMap,
      ships,
      updateOccupiedCells,
    ]
  );
  const [shipState, dispatch] = useReducer(reducer, createIdleState());

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

  const cellSizePx = useCellSizePx();
  return (
    <Grid container spacing={2}>
      <Grid item lg={6} md={7} xs={12}>
        <CellGrid
          commonCellStyle={
            (isKind(shipState, ShipStateKind.Adding) ||
              isKind(shipState, ShipStateKind.Adjusting)) && {
              cursor: 'pointer',
            }
          }
          className="m-auto"
          cellSizePx={cellSizePx}
          dimensions={boardSize}
          cellStyles={cellStyles}
          interaction={
            ships.length > 0
              ? {
                  cellHoverStyle,
                }
              : isKind(shipState, ShipStateKind.Adding) ||
                isKind(shipState, ShipStateKind.Adjusting)
              ? {
                  cellHoverStyle,
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
        />
      </Grid>
      <Grid item lg={6} md={5} xs={12}>
        <ShipTypeList
          cellSizePx={cellSizePx}
          shipTypes={shipTypes}
          onShipSelected={
            board
              ? (shipTypeId) => {
                  dispatch({ type: ShipStateActionType.SelectShipForAdding, shipTypeId });
                }
              : undefined
          }
          shipCountByType={shipCountByType}
          selectedShipTypeId={
            isKind(shipState, ShipStateKind.Adding) ? shipState.shipType.id : undefined
          }
        />
      </Grid>
    </Grid>
  );
}

interface ShipTypeListProps {
  shipTypes: DeepReadonly<ShipType[]>;
  onShipSelected?(shipTypeId: number): void;
  selectedShipTypeId?: number;
  shipCountByType: Record<number, number>;
  cellSizePx: number;
}

function ShipTypeList({
  shipTypes,
  onShipSelected,
  selectedShipTypeId,
  shipCountByType,
  cellSizePx,
}: ShipTypeListProps) {
  const shipNameVariant = useTypographyVariant();
  const colors = useGameColors();

  return (
    <Stack direction="column" spacing={2} flexWrap="wrap">
      {shipTypes.map((s) => {
        const styles: CellGridProps['cellStyles'] =
          s.id === selectedShipTypeId
            ? iterate([{ x: 0, y: 0 }])
                .concat(s.cellOffsets1)
                .map((p) => t(encodePoint(p), { backgroundColor: colors.selectedShip }))
                .toMap()
            : undefined;
        return (
          // Has stupid spacing on row wrap at the beginning, takes too much space.
          // <Stack direction={{ lg: 'row', md: 'column', sm: 'row', xs: 'column' }}>
          // </Stack>
          <Grid key={s.id} container justifyContent="center">
            <Grid item xs={12}>
              <Typography align="left" variant={shipNameVariant}>
                {s.shipCount}x<FormattedMessage id={s.name} />
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <CellGrid
                cellSizePx={cellSizePx}
                points={[{ x: 0, y: 0 }, ...s.cellOffsets1]}
                cellStyles={styles}
                interaction={
                  onShipSelected && {
                    cellHoverStyle: {
                      cursor: 'pointer',
                    },
                    onCellClick:
                      shipCountByType[s.id] > 0
                        ? // eslint-disable-next-line @typescript-eslint/no-unused-vars
                          (cell: Point) => {
                            onShipSelected(s.id);
                          }
                        : undefined,
                  }
                }
              />
            </Grid>
          </Grid>
        );
      })}
    </Stack>
  );
}
