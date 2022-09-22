import { iterate } from 'iterare';
import { fromEntries } from '../../app/object';
import { DeepReadonly, t } from '../../app/types';
import { ShipType } from '../../models/game';

export function getShipTypeCountMap(shipTypes: DeepReadonly<ShipType[]>): Record<number, number> {
  return fromEntries(iterate(shipTypes).map((type) => t(type.shipTypeId, type.shipCount)));
}
