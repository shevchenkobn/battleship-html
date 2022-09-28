import { Theme } from '@mui/material';
import { SystemCssProperties } from '@mui/system/styleFunctionSx/styleFunctionSx';
import { iterate } from 'iterare';
import { useMemo } from 'react';
import { DeepReadonly, encodePoint, Point, t } from '../../app/types';
import {
  Board,
  BoardCellStatus,
  defaultBoardSize,
  PlayerTurnHistory,
  Ship,
  ShipType,
} from '../../models/game';
import { CellStyle } from './CellGrid';
import { useGameColors } from './hooks';
import { getCellStyle, getShipTypeCountMap } from './lib';
import { PlayerGameView } from './PlayerGameView';

export interface PlayerBoardViewProps {
  ships: Ship[];
  sunkShips: Ship[];
  board: Board;
  shipTypes: ShipType[];
  enemyTurns: PlayerTurnHistory;
}

export function PlayerBoardView({
  ships,
  sunkShips,
  board,
  shipTypes,
  enemyTurns,
}: DeepReadonly<PlayerBoardViewProps>) {
  const shipCountByType = useMemo(() => {
    const countMap = getShipTypeCountMap(shipTypes);
    for (const ship of sunkShips) {
      countMap[ship.shipTypeId] -= 1;
    }
    return countMap;
  }, [shipTypes, sunkShips]);

  const colors = useGameColors();
  const cellStyles = useMemo(() => {
    const cellStyles: Map<string, CellStyle> = iterate(ships)
      .map((s) => s.shipCells)
      .flatten()
      .map((c) => t(encodePoint(c), getCellStyle(colors.boardShip)))
      .toMap();
    for (const p of iterate(enemyTurns)
      .map((turn) => turn.cells)
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
  }, [ships, colors.boardShip, colors.emptyHit, colors.shipHit, enemyTurns, board]);
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
