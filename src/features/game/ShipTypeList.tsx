import { Grid, Stack } from '@mui/material';
import Typography from '@mui/material/Typography';
import { iterate } from 'iterare';
import { useMemo, ReactNode } from 'react';
import { FormattedMessage } from 'react-intl';
import { DeepReadonly, encodePoint, Point, t } from '../../app/types';
import { ShipType } from '../../models/game';
import { CellGrid, CellGridProps } from './CellGrid';
import { useGameColors, useTypographyVariant } from './hooks';
import { getShipTypeCountMap } from './lib';

export interface ShipTypeListProps {
  shipTypes: DeepReadonly<ShipType[]>;
  onShipSelected?(shipTypeId: number): void;
  selectedShipTypeId?: number;
  shipCountByType?: Record<number, number>;
  cellSizePx: number;
  beforeChildren?: ReactNode;
}

export function ShipTypeList({
  shipTypes,
  onShipSelected,
  selectedShipTypeId,
  cellSizePx,
  beforeChildren,
  ...props
}: ShipTypeListProps) {
  const shipNameVariant = useTypographyVariant();
  const colors = useGameColors();
  const shipCountByType = useMemo(
    () => props.shipCountByType ?? getShipTypeCountMap(shipTypes),
    [props.shipCountByType, shipTypes]
  );

  return (
    <Stack direction="column" spacing={2} flexWrap="wrap">
      {beforeChildren}
      {shipTypes.map((s) => {
        const styles: CellGridProps['cellStyles'] =
          s.shipTypeId === selectedShipTypeId
            ? iterate([{ x: 0, y: 0 }])
                .concat(s.cellOffsets1)
                .map((p) => t(encodePoint(p), { backgroundColor: colors.selectedShip }))
                .toMap()
            : undefined;
        return (
          // Has stupid spacing on row wrap at the beginning, takes too much space.
          // <Stack direction={{ lg: 'row', md: 'column', sm: 'row', xs: 'column' }}>
          // </Stack>
          <Grid key={s.shipTypeId} container justifyContent="center">
            <Grid item xs={12}>
              <Typography
                align="left"
                variant={shipNameVariant}
                color={shipCountByType[s.shipTypeId] > 0 ? 'text.primary' : 'text.disabled'}
              >
                {shipCountByType[s.shipTypeId]}x <FormattedMessage id={s.name} />
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <CellGrid
                cellSizePx={cellSizePx}
                points={[{ x: 0, y: 0 }, ...s.cellOffsets1]}
                cellStyles={styles}
                interaction={
                  onShipSelected && shipCountByType[s.shipTypeId] > 0
                    ? {
                        cellHoverStyle: {
                          cursor: 'pointer',
                        },
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        onCellClick(cell: Point) {
                          onShipSelected(s.shipTypeId);
                        },
                      }
                    : undefined
                }
              />
            </Grid>
          </Grid>
        );
      })}
    </Stack>
  );
}
