import { Button, Stack, Theme } from '@mui/material';
import Typography from '@mui/material/Typography';
import { SystemCssProperties } from '@mui/system/styleFunctionSx/styleFunctionSx';
import { iterate } from 'iterare';
import React, { useEffect, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { MessageId } from '../../app/intl';
import { arePointsEqual, decodePoint, DeepReadonly, encodePoint, Point, t } from '../../app/types';
import {
  Board,
  BoardCellStatus,
  defaultBoardSize,
  getSurroundingCells,
  PlayerTurnHistory,
  Ship,
  ShipType,
} from '../../models/game';
import { Player, PlayerIndex } from '../../models/player';
import { CellStyle, getDefaultCellHoverStyle } from './CellGrid';
import './GameTurn.scss';
import { useGameColors, useTypographyVariant } from './hooks';
import { getCellStyle, getStyleRef } from './lib';
import { PlayerGameView } from './PlayerGameView';
import { PlayerName } from './PlayerName';

export interface GameTurnProps {
  shipTypes: ShipType[];
  enemySunkShips: Ship[];
  enemyBoard: Board;
  score: number;
  playerTurns: PlayerTurnHistory;
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
  playerTurns,
  player,
  playerIndex,
  isShooting,
  confirmText,
  onConfirmClick,
}: DeepReadonly<GameTurnProps>) {
  const [hoveredCell, setHoveredCell] = useState<Point | null>(null);
  const [selectedCell, setSelectedCell] = useState<Point | null>(null);

  useEffect(() => {
    setHoveredCell(null);
    setSelectedCell(null);
  }, [playerIndex]);

  const sunkShipCountByType = useMemo(() => {
    const countMap: Record<number, number> = {};
    for (const type of shipTypes) {
      countMap[type.shipTypeId] = 0;
    }
    for (const ship of enemySunkShips) {
      countMap[ship.shipTypeId] += 1;
    }
    return countMap;
  }, [enemySunkShips, shipTypes]);
  const [
    /**
     * A set of shot cells.
     */ shotCells,
    /**
     * A set of surrounding cells.
     */ surroundingSunkShipCells,
  ] = useMemo(() => {
    const shotCells = new Set<string>();
    const surroundingCells = new Set<string>();
    for (const ship of enemySunkShips) {
      for (const cell of iterate(ship.shipCells).map(encodePoint)) {
        shotCells.add(cell);
      }
      for (const cell of iterate(getSurroundingCells(ship.shipCells, defaultBoardSize)).map(
        encodePoint
      )) {
        surroundingCells.add(cell);
      }
    }
    for (const cell of iterate(playerTurns)
      .map((turn) => turn.cells)
      .flatten()
      .filter((c) => enemyBoard[c.x][c.y].status !== BoardCellStatus.Untouched)
      .map(encodePoint)) {
      shotCells.add(cell);
    }
    return [shotCells, surroundingCells];
  }, [enemyBoard, enemySunkShips, playerTurns]);

  const colors = useGameColors();
  const cellStyles = useMemo(() => {
    const cellStyles: Map<string, CellStyle> = iterate(surroundingSunkShipCells)
      .map((c) => t(c, getCellStyle(colors.surroundingShipWater)))
      .toMap();
    for (const p of iterate(shotCells).map(decodePoint)) {
      const style = getStyleRef(cellStyles, p);
      switch (enemyBoard[p.x][p.y].status) {
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
    if (!isShooting) {
      return cellStyles;
    }
    if (selectedCell) {
      const style = getStyleRef(cellStyles, selectedCell);
      style.backgroundColor = colors.selectedShip;
    }
    if (hoveredCell) {
      const key = encodePoint(hoveredCell);
      let hoverStyle = cellStyles.get(key) as SystemCssProperties<Theme>;
      hoverStyle = Object.assign(getDefaultCellHoverStyle(), hoverStyle);
      cellStyles.set(key, hoverStyle);
      if (shotCells.has(key) || surroundingSunkShipCells.has(key)) {
        hoverStyle.cursor = 'not-allowed';
      }
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
    return cellStyles;
  }, [
    surroundingSunkShipCells,
    isShooting,
    selectedCell,
    hoveredCell,
    colors.surroundingShipWater,
    colors.emptyHit,
    colors.shipHit,
    colors.selectedShip,
    colors.hoveredLines,
    shotCells,
    enemyBoard,
  ]);

  const typographyVariant = useTypographyVariant();
  return (
    <Stack direction="column">
      <Stack
        direction={{ sm: 'column', md: 'row' }}
        alignItems="center"
        className="GameTurn-header"
        justifyContent="space-around"
      >
        <PlayerName player={player} index={playerIndex} />
        <Typography variant={typographyVariant}>
          <FormattedMessage id={MessageId.Turn} />: {playerTurns.length}
        </Typography>
        <Typography variant={typographyVariant}>
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
              setHoveredCell(null);
              setSelectedCell(null);
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
                cellHoverStyle: {},
                onCellHoverChange(cell: Point, isHovering: boolean) {
                  setHoveredCell(isHovering ? cell : null);
                },
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                onCellClick(cell: Point, event: React.MouseEvent<HTMLDivElement>) {
                  const key = encodePoint(cell);
                  if (!shotCells.has(key) && !surroundingSunkShipCells.has(key)) {
                    setSelectedCell(
                      selectedCell && arePointsEqual(cell, selectedCell) ? null : cell
                    );
                  }
                },
              }
            : undefined
        }
        shipTypesProps={{
          shipCountByType: sunkShipCountByType,
          beforeChildren: (
            <Typography variant={typographyVariant}>
              <FormattedMessage id={MessageId.SunkTitle} />:
            </Typography>
          ),
        }}
      />
    </Stack>
  );
}
