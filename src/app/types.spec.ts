import { normalizeMinus0 } from '../test-lib/lib';
import { addPoint, decodePoint, encodePoint, invertPoint, subtractPoint } from './types';

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
