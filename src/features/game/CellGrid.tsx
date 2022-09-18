import { Paper, Stack, SxProps, Theme } from '@mui/material';
import Box from '@mui/material/Box';
import React from 'react';
import { useStyleProps } from '../../app/hooks';
import { StyleProps } from '../../app/styles';
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
  /**
   * @default {false}
   */
  noHover?: boolean;
} & StyleProps;

export function CellGrid(props: CellGridProps) {
  const styleProps = useStyleProps(props);
  const cellSizePx = props.cellSizePx ?? defaultCellSize;
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
    <Stack
      {...styleProps}
      direction="row"
      maxWidth={cellSizePx * dimensions.x}
      sx={{ overflow: 'auto', width: 'auto' }}
    >
      {Array(dimensions.x)
        .fill(null)
        .map((_, x) => (
          <Stack key={'column' + x} direction="column">
            {Array(dimensions.y)
              .fill(null)
              .map((_, y) => (
                <Cell
                  key={'row' + y}
                  cellSize={cellSizePx}
                  empty={points.size !== 0 && !points.has(encodePoint({ x, y }))}
                  noHover={!!props.noHover}
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
  noHover: boolean;
}

function Cell({ cellSize, empty, noHover }: CellProps) {
  const sx: SxProps<Theme> = { width: cellSize, height: cellSize };
  return empty ? (
    <Box sx={{ ...sx, opacity: 0 }} />
  ) : (
    <Paper
      variant="outlined"
      sx={{
        ...sx,
        borderColor: 'grey.700',
        ...(!noHover && {
          cursor: 'pointer',
          '&:hover': { border: 2, borderColor: 'secondary.light' },
        }),
      }}
    />
  );
}
