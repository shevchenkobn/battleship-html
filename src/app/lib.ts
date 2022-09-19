import { assert } from './types';

export function normalizeToLimit(value: number, limit: number) {
  assert(limit > 0, 'Value and limit must be non-negative.');
  return value - Math.trunc(value / limit) * limit;
}
