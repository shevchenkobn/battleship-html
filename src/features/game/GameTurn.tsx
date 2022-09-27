import { Button, Stack } from '@mui/material';
import Typography from '@mui/material/Typography';
import { iterate } from 'iterare';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { MessageId } from '../../app/intl';
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
import { Player, PlayerIndex } from '../../models/player';
import { CellStyle } from './CellGrid';
import { useGameColors } from './hooks';
import { getCellStyle, getStyleRef } from './lib';
import { PlayerGameView } from './PlayerGameView';
import { PlayerName } from './PlayerName';

export interface GameTurnProps {
  shipTypes: ShipType[];
  enemySunkShips: Ship[];
  enemyBoard: Board;
  score: number;
  turnHistory: TurnHistory;
  player: Player;
  playerIndex: PlayerIndex;
  isShooting: boolean;
  confirmText: React.ReactNode;
  onConfirmClick(cell?: Point): void;
}

export function GameTurn({
  shipTypes,
  enemySunkShips,
  enemyBoard,
  score,
  turnHistory,
  player,
  playerIndex,
  isShooting,
  confirmText,
  onConfirmClick,
}: DeepReadonly<GameTurnProps>) {
  const [hoveredCell, setHoveredCell] = useState<Point | null>(null);
  const [selectedCell, setSelectedCell] = useState<Point | null>(null);

  const sunkShipCountByType = useMemo(() => {
    const countMap: Record<number, number> = {};
    for (const ship of enemySunkShips) {
      countMap[ship.shipTypeId] += 1;
    }
    return countMap;
  }, [enemySunkShips]);
  const [
    /**
     * A set of surrounding cells.
     */ surroundingSunkShipCells,
    setSurroundingSunkShipCells,
  ] = useState(new Set<string>());
  const [
    /**
     * A set of shot cells.
     */ shotCells,
    setShotCells,
  ] = useState(new Set<string>());
  const recalculateTouchedCells = useCallback(
    (excludeShipId?: number) => {
      const shotCells = new Set<string>();
      const surroundingCells = new Set<string>();
      for (const ship of enemySunkShips) {
        if (ship.shipId === excludeShipId) {
          continue;
        }
        for (const cell of iterate(ship.shipCells).map(encodePoint)) {
          shotCells.add(cell);
        }
        for (const cell of iterate(getSurroundingCells(ship.shipCells, defaultBoardSize)).map(
          encodePoint
        )) {
          surroundingCells.add(cell);
        }
      }
      setShotCells(shotCells);
      setSurroundingSunkShipCells(surroundingCells);
    },
    [enemySunkShips]
  );
  useEffect(() => {
    recalculateTouchedCells();
  }, [recalculateTouchedCells]);

  const colors = useGameColors();
  const cellStyles = useMemo(() => {
    const cellStyles: Map<string, CellStyle> = iterate(surroundingSunkShipCells)
      .map((c) => t(c, getCellStyle(colors.surroundingShipWater)))
      .toMap();
    for (const p of iterate(turnHistory)
      .map((t) => t.cells[playerIndex])
      .flatten()) {
      const style = getStyleRef(cellStyles, p);
      switch (enemyBoard[p.x][p.y].status) {
        case BoardCellStatus.NoShip: {
          style.backgroundColor = colors.emptyHit;
          break;
        }
        case BoardCellStatus.Hit: {
          style.backgroundColor = colors.shipHit;
          style.cursor = 'not-allowed';
          break;
        }
        default:
          throw new TypeError('State discrepancy: the cell from history was not shot!');
      }
      if (hoveredCell) {
        for (let x = 0; x < defaultBoardSize.x; x += 1) {
          if (x === hoveredCell.x) {
            continue;
          }
          const style = getStyleRef(cellStyles, { x, y: hoveredCell.y });
          style.borderColor = colors.hoveredLines;
        }
        for (let y = 0; y < defaultBoardSize.y; y += 1) {
          if (y === hoveredCell.y) {
            continue;
          }
          const style = getStyleRef(cellStyles, { x: hoveredCell.x, y });
          style.borderColor = colors.hoveredLines;
        }
      }
    }
    return cellStyles;
  }, [
    colors.emptyHit,
    colors.hoveredLines,
    colors.shipHit,
    colors.surroundingShipWater,
    enemyBoard,
    hoveredCell,
    playerIndex,
    surroundingSunkShipCells,
    turnHistory,
  ]);
  return (
    <Stack direction="column" spacing={3}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <PlayerName player={player} index={playerIndex} />
        <Typography variant="h3">
          <FormattedMessage id={MessageId.Turn} />: {turnHistory.length}
        </Typography>
        <Typography variant="h3">
          <FormattedMessage id={MessageId.Score} />: {score}
        </Typography>
        <Button
          disabled={isShooting && !selectedCell}
          variant="contained"
          size="large"
          color="secondary"
          onClick={() => {
            if (selectedCell) {
              onConfirmClick(selectedCell);
            } else {
              onConfirmClick();
            }
          }}
        >
          {confirmText as React.ReactNode}
        </Button>
      </Stack>
      <PlayerGameView
        boardSize={defaultBoardSize}
        shipTypes={shipTypes}
        boardStyle={{ className: 'm-auto' }}
        boardCellStyles={cellStyles}
        boardInteraction={
          isShooting
            ? {
                onCellHoverChange(cell: Point, isHovering: boolean) {
                  setHoveredCell(isHovering ? cell : null);
                },
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                onCellClick(cell: Point, event: React.MouseEvent<HTMLDivElement>) {
                  const key = encodePoint(cell);
                  if (!shotCells.has(key) && !surroundingSunkShipCells.has(key)) {
                    setSelectedCell(cell);
                  }
                },
              }
            : undefined
        }
        shipTypesProps={{
          shipCountByType: sunkShipCountByType,
          beforeChildren: (
            <Typography variant="h3">
              <FormattedMessage id={MessageId.SunkTitle} />:
            </Typography>
          ),
        }}
      />
    </Stack>
  );
}
