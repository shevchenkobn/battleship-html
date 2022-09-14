import { Grid, Paper, Stack } from '@mui/material';
import { Point } from '../../app/types';

export interface CellGridProps {
  dimensions: Point;
  /**
   * @default 48
   */
  cellSize?: number;
}

export function CellGrid({ dimensions, cellSize = 48 }: CellGridProps) {
  return (
    <Stack direction="row">
      {Array(dimensions.x)
        .fill(null)
        .map((_, i) => (
          <Stack key={'column' + i} direction="column">
            {Array(dimensions.y)
              .fill(null)
              .map((_, i) => (
                <Paper
                  sx={{ width: cellSize, height: cellSize, border: 1, borderColor: 'grey.700' }}
                  variant="outlined"
                  key={'row' + i}
                />
              ))}
          </Stack>
        ))}
    </Stack>
  );
}
