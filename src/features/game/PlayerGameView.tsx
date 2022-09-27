import { Grid } from '@mui/material';
import { StyleProps } from '../../app/styles';
import { DeepReadonly, Point } from '../../app/types';
import { ShipType } from '../../models/game';
import { CellGrid, CellGridProps, CellStyle } from './CellGrid';
import { useCellSizePx } from './hooks';
import { ShipTypeList, ShipTypeListProps } from './ShipTypeList';

export interface PlayerGameViewProps {
  boardSize: DeepReadonly<Point>;
  shipTypes: DeepReadonly<ShipType[]>;
  /**
   * A map of encoded {@link Point} (see {@link encodePoint}) to {@link CellStyle} styles.
   */
  boardCellStyles?: ReadonlyMap<string, CellStyle>;
  boardCommonCellStyle?: CellStyle;
  boardStyle?: StyleProps;
  boardInteraction?: CellGridProps['interaction'];

  shipTypesProps?: Omit<ShipTypeListProps, 'cellSizePx' | 'shipTypes'>;
}

export function PlayerGameView({
  boardSize,
  shipTypes,
  boardCellStyles,
  boardCommonCellStyle,
  boardStyle,
  boardInteraction,
  shipTypesProps,
}: PlayerGameViewProps) {
  const cellSizePx = useCellSizePx();
  return (
    <Grid container spacing={{ xs: 1, sm: 2 }}>
      <Grid item lg={6} md={7} xs={12}>
        <CellGrid
          {...boardStyle}
          commonCellStyle={boardCommonCellStyle}
          cellSizePx={cellSizePx}
          dimensions={boardSize}
          cellStyles={boardCellStyles}
          interaction={boardInteraction}
        />
      </Grid>
      <Grid item lg={6} md={5} xs={12}>
        <ShipTypeList shipTypes={shipTypes} cellSizePx={cellSizePx} {...shipTypesProps} />
      </Grid>
    </Grid>
  );
}
