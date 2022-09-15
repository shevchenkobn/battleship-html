import { Grid, Paper, Stack, SxProps, Theme } from '@mui/material';
import Box from '@mui/material/Box';
import { ComponentType } from 'react';
import { encodePoint, Point, subtractPoint } from '../../app/types';
import { getBoundingRectangle, normalizeBoundingRectangle } from '../../models/game';

export const defaultCellSize = 48;

export type CellGridProps = (
  | {
      points: Point[];
    }
  | { dimensions: Point }
) & {
  /**
   * @default {cellSize}
   */
  cellSizePx?: number;
};

export function CellGrid(props: CellGridProps) {
  const cellSize = props.cellSizePx ?? defaultCellSize;
  const points = new Set();
  let dimensions: Point;
  if ('points' in props) {
    const boundingRectangle = getBoundingRectangle(props.points);
    dimensions = normalizeBoundingRectangle(boundingRectangle);
    for (const point of props.points) {
      points.add(encodePoint(subtractPoint(point, boundingRectangle.topLeft)));
    }
  } else {
    dimensions = props.dimensions;
  }
  return (
    <Stack direction="row">
      {Array(dimensions.x)
        .fill(null)
        .map((_, x) => (
          <Stack key={'column' + x} direction="column">
            {Array(dimensions.y)
              .fill(null)
              .map((_, y) => (
                <Cell
                  key={'row' + y}
                  cellSize={cellSize}
                  empty={points.size !== 0 && !points.has(encodePoint({ x, y }))}
                />
              ))}
          </Stack>
        ))}
    </Stack>
  );
}

interface CellProps {
  cellSize: number;
  empty: boolean;
}

function Cell({ cellSize, empty }: CellProps) {
  const sx: SxProps<Theme> = { width: cellSize, height: cellSize };
  return empty ? (
    <Box sx={{ ...sx, opacity: 0 }} />
  ) : (
    <Paper variant="outlined" sx={{ ...sx, borderColor: 'grey.700' }} />
  );
}
