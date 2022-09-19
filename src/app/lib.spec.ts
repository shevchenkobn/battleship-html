import { normalizeToLimit } from './lib';

it('function ' + normalizeToLimit.name, () => {
  expect(normalizeToLimit(0, 4)).toEqual(0);
  expect(normalizeToLimit(3, 4)).toEqual(3);
  expect(normalizeToLimit(4, 4)).toEqual(0);
  expect(normalizeToLimit(2, 5)).toEqual(2);

  expect(normalizeToLimit(-1, 5)).toEqual(-1);
  expect(normalizeToLimit(-2, 5)).toEqual(-2);
  expect(normalizeToLimit(-3, 5)).toEqual(-3);
  expect(normalizeToLimit(-5, 5)).toEqual(0);

  expect(normalizeToLimit(-5, 4)).toEqual(-1);
  expect(normalizeToLimit(-22, 4)).toEqual(-2);
  expect(normalizeToLimit(-11, 4)).toEqual(-3);
  expect(normalizeToLimit(-20, 5)).toEqual(0);
  expect(normalizeToLimit(20, 5)).toEqual(0);

  expect(() => normalizeToLimit(-1, -2)).toThrow();
  expect(() => normalizeToLimit(2, -4)).toThrow();
  expect(() => normalizeToLimit(0, -4)).toThrow();
});
