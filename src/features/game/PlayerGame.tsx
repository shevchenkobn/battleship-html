import { Grid, Stack } from '@mui/material';
import Typography from '@mui/material/Typography';
import { FormattedMessage } from 'react-intl';
import { DeepReadonly, Point } from '../../app/types';
import { ShipType } from '../../models/game';
import { CellGrid } from './CellGrid';
import { useCellSizePx, useTypographyVariant } from './hooks';

export interface PlayerGameProps {
  boardSize: Point;
  shipTypes: DeepReadonly<ShipType[]>;
  interactive: boolean;
}

export function PlayerGame({ boardSize, shipTypes, interactive }: PlayerGameProps) {
  const cellSizePx = useCellSizePx();
  return (
    <Grid container spacing={2}>
      <Grid item lg={6} md={7} xs={12}>
        <CellGrid
          className="m-auto"
          cellSizePx={cellSizePx}
          dimensions={boardSize}
          noHover={!interactive}
        />
      </Grid>
      <Grid item lg={6} md={5} xs={12}>
        <ShipTypeList cellSizePx={cellSizePx} shipTypes={shipTypes} interactive={interactive} />
      </Grid>
    </Grid>
  );
}

interface ShipTypeListProps {
  shipTypes: DeepReadonly<ShipType[]>;
  interactive: boolean;
  cellSizePx: number;
}

function ShipTypeList({ shipTypes, interactive, cellSizePx }: ShipTypeListProps) {
  const shipNameVariant = useTypographyVariant();
  return (
    <Stack direction="column" spacing={2} flexWrap="wrap">
      {shipTypes.map((s) => (
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
              noHover={!interactive}
            />
          </Grid>
        </Grid>
      ))}
    </Stack>
  );
}
