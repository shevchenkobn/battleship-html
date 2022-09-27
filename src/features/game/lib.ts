import { Theme } from '@mui/material';
import { SystemCssProperties } from '@mui/system/styleFunctionSx/styleFunctionSx';
import { iterate } from 'iterare';
import { fromEntries } from '../../app/object';
import { DeepReadonly, encodePoint, Point, t } from '../../app/types';
import { ShipType } from '../../models/game';
import { CellStyle } from './CellGrid';

export function getShipTypeCountMap(shipTypes: DeepReadonly<ShipType[]>): Record<number, number> {
  return fromEntries(iterate(shipTypes).map((type) => t(type.shipTypeId, type.shipCount)));
}

export interface BoardCellStylesConfig {
  shipColor: string;
  surroundingShipWaterColor: string;
  occupiedCells: Iterable<string>;
  shipsCells: Iterable<string>;
}

/**
 *
 * @param {Iterable<string>} occupiedCells Value is encoded point.
 * @param {Iterable<string>} shipsCells Value is encoded point.
 * @param {string} shipColor
 * @param {string} surroundingShipWaterColor
 * @returns {Map<string, CellStyle>} Key is encoded point.
 */
export function getBoardCellStyles({
  occupiedCells,
  shipsCells,
  shipColor,
  surroundingShipWaterColor,
}: DeepReadonly<BoardCellStylesConfig>): Map<string, CellStyle> {
  return iterate(occupiedCells)
    .map((c) => t(c, getCellStyle(surroundingShipWaterColor)))
    .concat(iterate(shipsCells).map((c) => t(c, getCellStyle(shipColor))))
    .toMap();
}

export function getCellStyle(color: string, baseStyle: CellStyle = {}): CellStyle {
  return {
    ...baseStyle,
    backgroundColor: color,
  };
}
export function getStyleRef(
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
