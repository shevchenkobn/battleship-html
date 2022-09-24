import { normalizeMinus0 } from '../test-lib/lib';
import {
  addPoint,
  arraysUnorderedEqual,
  decodePoint,
  encodePoint,
  invertPoint,
  subtractPoint,
} from './types';

/**
 * Not tested:
 * - {@link arePointsEqual}: TODO:
 */
describe('Point', () => {
  it('function ' + invertPoint.name, () => {
    expect(normalizeMinus0(invertPoint({ x: 0, y: 0 }))).toEqual({ x: 0, y: 0 });
    expect(normalizeMinus0(invertPoint({ x: 1, y: 2 }))).toEqual({ x: -1, y: -2 });
    const nanPoint = invertPoint({ x: NaN, y: 0 });
    expect(nanPoint.x).toEqual(NaN);
    expect(normalizeMinus0(nanPoint.y)).toEqual(0);
  });

  it('function ' + encodePoint.name, () => {
    expect(encodePoint({ x: 0, y: 0 })).toEqual('0,0');
    expect(encodePoint({ x: 1, y: 2 })).toEqual('1,2');
    expect(encodePoint({ x: NaN, y: 0 })).toEqual('NaN,0');
  });

  it('function ' + decodePoint.name, () => {
    expect(decodePoint('0,0')).toEqual({ x: 0, y: 0 });
    expect(decodePoint('1,2')).toEqual({ x: 1, y: 2 });
    expect(decodePoint('NaN,0')).toEqual({ x: NaN, y: 0 });

    expect(decodePoint('garbage')).toEqual({ x: NaN, y: NaN });
    expect(decodePoint('1,half-garbage')).toEqual({ x: 1, y: NaN });
    expect(decodePoint('half-garbage,4')).toEqual({ x: NaN, y: 4 });
    expect(decodePoint('3,4,5,2')).toEqual({ x: 3, y: 4 });
    expect(decodePoint('3,4garbage')).toEqual({ x: 3, y: 4 });
    expect(decodePoint('3garbage,4garbage')).toEqual({ x: 3, y: 4 });
    expect(decodePoint('3,4,garbage')).toEqual({ x: 3, y: 4 });
  });

  it('function ' + addPoint.name, () => {
    expect(addPoint({ x: 3, y: 4 }, { x: 2, y: -1 })).toEqual({ x: 5, y: 3 });
    expect(addPoint({ x: -3, y: -4 }, { x: 2, y: -1 })).toEqual({ x: -1, y: -5 });
    expect(addPoint({ x: 3, y: 4 }, { x: -2, y: -1 })).toEqual({ x: 1, y: 3 });
  });

  it('function ' + subtractPoint.name, () => {
    expect(subtractPoint({ x: 3, y: 4 }, { x: 2, y: -1 })).toEqual({ x: 1, y: 5 });
    expect(subtractPoint({ x: -3, y: -4 }, { x: 2, y: -1 })).toEqual({ x: -5, y: -3 });
    expect(subtractPoint({ x: 3, y: 4 }, { x: -2, y: -1 })).toEqual({ x: 5, y: 5 });
  });
});

describe('util functions', () => {
  it('function ' + arraysUnorderedEqual.name, () => {
    expect(arraysUnorderedEqual([], [])).toEqual(true);
    expect(arraysUnorderedEqual<any>([], [], (a, b) => a.v === b.v)).toEqual(true);

    expect(arraysUnorderedEqual([1], [1, 2])).toEqual(false);
    expect(arraysUnorderedEqual([1, 2, 3, 4], [1, 2, 3, 4])).toEqual(true);
    expect(arraysUnorderedEqual([1, 2, 3, 4], [4, 1, 2, 3])).toEqual(true);
    expect(arraysUnorderedEqual([1, 5, 3, 4], [4, 1, 2, 3])).toEqual(false);
    expect(arraysUnorderedEqual([1, 1, 1, 3], [3, 3, 3, 1])).toEqual(false);
    expect(arraysUnorderedEqual([1, 6, 7, 3], [3, 3, 3, 1])).toEqual(false);
    expect(arraysUnorderedEqual([1, 3, 3, 4], [4, 1, 2, 3])).toEqual(false);
    expect(arraysUnorderedEqual([false, true, false], [true, false, false])).toEqual(true);
    expect(arraysUnorderedEqual([false, false, false], [false, false, false])).toEqual(true);
    expect(
      arraysUnorderedEqual(
        [undefined, undefined, undefined, undefined],
        [undefined, undefined, undefined, undefined]
      )
    ).toEqual(true);
    expect(
      arraysUnorderedEqual([undefined, null, null, undefined], [null, undefined, undefined, null])
    ).toEqual(true);

    expect(
      arraysUnorderedEqual(
        [{ v: 42 }, { v: 'asdf' }, { v: false }],
        [{ v: 42 }, { v: 'asdf' }, { v: false }],
        (a, b) => a.v === b.v
      )
    ).toEqual(true);
    expect(
      arraysUnorderedEqual(
        [{ v: false }, { v: 'asdf' }, { v: 42 }, { v: null }],
        [{ v: 42 }, { v: 'asdf' }, { v: null }, { v: false }],
        (a, b) => a.v === b.v
      )
    ).toEqual(true);
    expect(
      arraysUnorderedEqual(
        [{ v: false }, { v: 'asdf' }, { v: 42 }],
        [{ v: 42 }, { v: 'asdf' }],
        (a, b) => a.v === b.v
      )
    ).toEqual(false);
    expect(
      arraysUnorderedEqual(
        [{ v: false }, { v: 42 }],
        [{ v: 42 }, { v: 'asdf' }, { v: false }],
        (a, b) => a.v === b.v
      )
    ).toEqual(false);
    expect(
      arraysUnorderedEqual(
        [{ v: false }, { v: 'nought' }, { v: 42 }, { v: null }],
        [{ v: 42 }, { v: 'asdf' }, { v: null }, { v: false }],
        (a, b) => a.v === b.v
      )
    ).toEqual(false);
    expect(
      arraysUnorderedEqual(
        [{ v: 42 }, { v: 'asdf' }, { v: 42 }, { v: 42 }],
        [{ v: 'asdf' }, { v: 42 }, { v: 'asdf' }, { v: 'asdf' }],
        (a, b) => a.v === b.v
      )
    ).toEqual(false);
    expect(
      arraysUnorderedEqual(
        [{ v: 42 }, { v: 'asdf' }, { v: 42 }, { v: 42 }],
        [{ v: 'asdf' }, { v: 42 }, { v: 'asdf' }, { v: false }],
        (a, b) => a.v === b.v
      )
    ).toEqual(false);
  });
});
