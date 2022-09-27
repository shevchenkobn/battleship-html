import { Theme } from '@mui/material';
import { SystemCssProperties } from '@mui/system/styleFunctionSx/styleFunctionSx';
import { iterate } from 'iterare';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { DeepReadonly, encodePoint, Point, t } from '../../app/types';
import {
  Board,
  BoardCellStatus,
  defaultBoardSize,
  getSurroundingCells,
  Ship,
  ShipType,
  TurnHistory,
} from '../../models/game';
import { PlayerIndex } from '../../models/player';
import { CellStyle } from './CellGrid';
import { useGameColors } from './hooks';
import { getCellStyle, getShipTypeCountMap } from './lib';
import { PlayerGameView } from './PlayerGameView';

export interface PlayerBoardViewProps {
  ships: Ship[];
  board: Board;
  shipTypes: ShipType[];
  turnHistory: TurnHistory;
  playerIndex: PlayerIndex;
}

export function PlayerBoardView({
  ships,
  board,
  shipTypes,
  turnHistory,
  playerIndex,
}: DeepReadonly<PlayerBoardViewProps>) {
  const shipCountByType = useMemo(() => {
    const countMap = getShipTypeCountMap(shipTypes);
    for (const ship of ships) {
      countMap[ship.shipTypeId] -= 1;
    }
    return countMap;
  }, [shipTypes, ships]);

  const [
    /**
     * A set of surrounding cells.
     */ surroundingSunkShipCells,
    setSurroundingSunkShipCells,
  ] = useState(new Set<string>());
  const [
    /**
     * A set of ship cells.
     */ shipCells,
    setShipCells,
  ] = useState(new Set<string>());
  const recalculateTouchedCells = useCallback(
    (excludeShipId?: number) => {
      const shipCells = new Set<string>();
      const surroundingCells = new Set<string>();
      for (const ship of ships) {
        if (ship.shipId === excludeShipId) {
          continue;
        }
        for (const cell of iterate(ship.shipCells).map(encodePoint)) {
          shipCells.add(cell);
        }
        for (const cell of iterate(getSurroundingCells(ship.shipCells, defaultBoardSize)).map(
          encodePoint
        )) {
          surroundingCells.add(cell);
        }
      }
      setSurroundingSunkShipCells(surroundingCells);
      setShipCells(shipCells);
    },
    [ships]
  );
  useEffect(() => {
    recalculateTouchedCells();
  }, [recalculateTouchedCells]);

  const colors = useGameColors();
  const cellStyles = useMemo(() => {
    const cellStyles: Map<string, CellStyle> = iterate(surroundingSunkShipCells)
      .map((c) => t(c, getCellStyle(colors.surroundingShipWater)))
      .concat(iterate(shipCells).map((c) => t(c, getCellStyle(colors.boardShip))))
      .toMap();
    for (const p of iterate(turnHistory)
      .map((t) => t.cells[playerIndex])
      .flatten()) {
      const style = getStyleRef(cellStyles, p);
      switch (board[p.x][p.y].status) {
        case BoardCellStatus.NoShip: {
          style.backgroundColor = colors.emptyHit;
          break;
        }
        case BoardCellStatus.Hit: {
          style.backgroundColor = colors.shipHit;
          break;
        }
        default:
          throw new TypeError('State discrepancy: the cell from history was not shot!');
      }
    }
    return cellStyles;
  }, [
    colors.boardShip,
    colors.emptyHit,
    colors.shipHit,
    colors.surroundingShipWater,
    board,
    playerIndex,
    shipCells,
    surroundingSunkShipCells,
    turnHistory,
  ]);
  return (
    <PlayerGameView
      boardSize={defaultBoardSize}
      shipTypes={shipTypes}
      boardStyle={{ className: 'm-auto' }}
      boardCellStyles={cellStyles}
      shipTypesProps={{
        shipCountByType,
      }}
    />
  );
}

function getStyleRef(
  map: Map<string, CellStyle>,
  point: DeepReadonly<Point>
): SystemCssProperties<Theme> {
  const key = encodePoint(point);
  let style = map.get(key);
  if (!style) {
    style = {};
    map.set(key, style);
  }
  return style;
}
