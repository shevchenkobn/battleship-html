import { Paper, Stack, SxProps, Theme } from '@mui/material';
import Box from '@mui/material/Box';
import { iterate } from 'iterare';
import React, { useMemo } from 'react';
import { useStyleProps } from '../../app/hooks';
import { StyleProps } from '../../app/styles';
import { assertNotMaybe, decodePoint, encodePoint, Point, subtractPoint, t } from '../../app/types';
import { getBoundingRectangle, normalizeBoundingRectangle } from '../../models/game';

export const defaultCellSize = 48;

export type CellGridProps = (
  | {
      points: Point[];
    }
  | { dimensions: Point }
) & {
  /**
   * @default {@link defaultCellSize}
   */
  cellSizePx?: number;
  /**
   * A map of encoded {@link Point} (see {@link encodePoint}) to {@link CellStyle} styles.
   */
  cellStyles?: ReadonlyMap<string, CellStyle>;
  commonCellStyle?: CellStyle;
  /**
   * Provide an empty object to enable default hovering.
   *
   * @default {null}
   */
  interaction?: {
    /**
     * @default Return value of {@link getDefaultCellHoverStyle}.
     */
    cellHoverStyle?: CellStyle;
    onCellHoverChange?(cell: Point, isHovering: boolean): void;
    onCellClick?(cell: Point): void;
  };
} & StyleProps;

/**
 * See usages for the default value.
 *
 * For simplicity only non-function `SxProps` are used.
 */
export type CellStyle = Omit<SxProps<Theme>, 'width' | 'height'>;

export function getDefaultCellHoverStyle(): CellStyle {
  return {
    cursor: 'pointer',
    '&:hover': { border: 2, borderColor: 'secondary.light' },
  };
}

export function CellGrid(props: CellGridProps) {
  const styleProps = useStyleProps(props);
  const cellSizePx = props.cellSizePx ?? defaultCellSize;
  const points = new Set();
  let dimensions: Point;
  let offset: Point | null = null;
  if ('points' in props) {
    const boundingRectangle = getBoundingRectangle(props.points);
    dimensions = normalizeBoundingRectangle(boundingRectangle);
    offset = boundingRectangle.topLeft;
    for (const point of props.points) {
      points.add(encodePoint(subtractPoint(point, offset)));
    }
  } else {
    dimensions = props.dimensions;
  }
  const commonCellStyle = props.commonCellStyle;
  const interaction = props.interaction;
  const cellStyles = useMemo(() => {
    if (!props.cellStyles) {
      return new Map();
    } else if (!offset) {
      return props.cellStyles;
    }
    return iterate(props.cellStyles.entries())
      .map(([decoded, style]) => {
        assertNotMaybe(offset);
        return t(encodePoint(subtractPoint(decodePoint(decoded), offset)), style);
      })
      .toMap();
  }, [offset, props]);

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
              .map((_, y) => {
                const encodedPoint = encodePoint({ x, y });
                const cellInteraction: CellProps['interaction'] = interaction
                  ? {
                      hoverStyle: interaction.cellHoverStyle ?? getDefaultCellHoverStyle(),
                      onCellHoverChange:
                        interaction.onCellHoverChange &&
                        ((isHovering: boolean) => {
                          interaction.onCellHoverChange?.({ x, y }, isHovering);
                        }),
                      onCellClick:
                        interaction.onCellClick &&
                        (() => {
                          interaction.onCellClick?.({ x, y });
                        }),
                    }
                  : null;
                return (
                  <Cell
                    key={'row' + y}
                    cellSize={cellSizePx}
                    empty={points.size !== 0 && !points.has(encodedPoint)}
                    style={Object.assign({}, commonCellStyle, cellStyles.get(encodedPoint))}
                    interaction={cellInteraction}
                  />
                );
              })}
          </Stack>
        ))}
    </Stack>
  );
}

interface CellProps {
  cellSize: number;
  empty: boolean;
  interaction: null | {
    hoverStyle: CellStyle;
    onCellHoverChange?(isHovering: boolean): void;
    onCellClick?(): void;
  };
  style?: CellStyle;
}

function Cell({ cellSize, empty, interaction, style }: CellProps) {
  const sx: SxProps<Theme> = Object.assign({}, style, { width: cellSize, height: cellSize });
  return empty ? (
    <Box sx={{ ...sx, opacity: 0 }} />
  ) : (
    <Paper
      variant="outlined"
      sx={{
        ...sx,
        borderColor: 'grey.700',
        ...(interaction && interaction.hoverStyle),
      }}
      onMouseEnter={
        (interaction &&
          interaction.onCellHoverChange &&
          (() => interaction.onCellHoverChange?.(true))) ||
        undefined
      }
      onMouseLeave={
        (interaction &&
          interaction.onCellHoverChange &&
          (() => interaction.onCellHoverChange?.(false))) ||
        undefined
      }
      onClick={
        (interaction && interaction.onCellClick && (() => interaction.onCellClick?.())) || undefined
      }
    />
  );
}
