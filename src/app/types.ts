import Decimal from 'decimal.js';
import { iterate } from 'iterare';
import { ReadonlyDate } from 'readonly-date';
import { GuardedMap, ReadonlyGuardedMap } from './map';

export type primitive = number | string | boolean | symbol | bigint;
export type Maybe<T> = T | null | undefined;
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type NonOptional<T> = T extends undefined ? never : T;
export type AsInterface<C> = {
  [K in keyof C]: C[K];
};

export type NotMaybe<T> = T extends null | undefined ? never : T;
export function isNotMaybe<T = unknown>(value: T): value is NotMaybe<T> {
  return value !== undefined && value !== null;
}
export function assertNotMaybe<T = unknown>(
  value: T,
  message = 'Asserted value is null or undefined!'
): asserts value is NotMaybe<T> {
  if (!isNotMaybe(value)) {
    throw new TypeError(message);
  }
}
export function asNotMaybe<T = unknown>(value: T): NotMaybe<T> {
  assertNotMaybe(value);
  return value;
}

export type Iter<T> = Iterator<T> | Iterable<T>;

export const asReadonly = Symbol('asReadonly');

export interface ReadonlyMarker<RT> {
  /**
   * WARNING: This symbol is used for compile time checks and is unsafe to read.
   *   You can read it only if you are sure that the type that implements the
   *   interface allows you to.
   */
  [asReadonly]: RT;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type DeepReadonly<T> = T extends ReadonlyMarker<infer RT>
  ? T[typeof asReadonly]
  : T extends Decimal
  ? T
  : T extends ReadonlyDate
  ? ReadonlyDate
  : T extends Iterator<infer V>
  ? Iterator<DeepReadonly<V>>
  : T extends ReadonlyGuardedMap<infer K, infer V>
  ? DeepReadonlyGuardedMap<K, V>
  : T extends ReadonlyMap<infer K, infer V>
  ? DeepReadonlyMap<K, V>
  : T extends ReadonlySet<infer V>
  ? DeepReadonlySet<V>
  : T extends ReadonlyArray<infer V>
  ? DeepReadonlyArray<V>
  : T extends (...args: infer A) => infer R
  ? (...args: A) => R
  : DeepReadonlyObject<T>;
// : T extends Iterable<infer V>
// ? Iterable<DeepReadonly<V>>
export type DeepReadonlyObject<T> = {
  readonly [P in keyof T]: DeepReadonly<T[P]>;
};

export type DeepReadonlyArray<T> = ReadonlyArray<DeepReadonly<T>>;

export type DeepReadonlySet<T> = ReadonlySet<DeepReadonly<T>>;

export type DeepReadonlyMap<K, V> = ReadonlyMap<DeepReadonly<K>, DeepReadonly<V>>;
export type DeepReadonlyGuardedMap<K, V> = ReadonlyGuardedMap<DeepReadonly<K>, DeepReadonly<V>>;

export const asPartial = Symbol('asPartial');

export interface PartialMarker<P> {
  /**
   * WARNING: This symbol is used for compile time checks and is unsafe to read.
   *   You can read it only if you are sure that the type that implements the
   *   interface allows you to.
   */
  [asPartial]: P;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type DeepPartial<T> = T extends PartialMarker<infer PT>
  ? T[typeof asPartial]
  : T extends Decimal
  ? T
  : // eslint-disable-next-line @typescript-eslint/no-unused-vars
  T extends GuardedMap<infer K, infer V>
  ? T
  : T extends Map<infer K, infer V>
  ? Map<DeepPartial<K>, DeepPartial<V>>
  : T extends Set<infer V>
  ? Set<DeepPartial<V>>
  : T extends (infer V)[]
  ? DeepPartial<V>[]
  : DeepPartialObject<T>;
export type DeepPartialObject<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};
export type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

/**
 * @deprecated
 */
export function t<A>(...args: [A]): [A];
export function t<A, B>(...args: [A, B]): [A, B];
export function t<A, B, C>(...args: [A, B, C]): [A, B, C];
export function t(...args: any[]): any[] {
  return args;
}

export function as<T>(value: any): value is T {
  return true;
}
// eslint-disable-next-line @typescript-eslint/no-empty-function
export function cast<T>(value: any): asserts value is T {}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function assertUnreachable(message = "Unreachable code, it won't be thrown."): never {
  throw new Error(message);
}

export type With<K extends keyof any, T = any> = T extends Record<K, infer V>
  ? Record<K, V> & T
  : never;

// Doesn't work
// export function isIn<K extends keyof any, T = any>(
//   key: K,
//   obj: T
// ): obj is With<K, T> {
//   return key in obj;
// }

export type SerializePropertyValue<T extends Record<any, any> = any, K = keyof T> = (
  value: T[K],
  object: T,
  key: K
) => any | undefined;

export interface Point {
  x: number;
  y: number;
}

export function arePointsEqual(point1: DeepReadonly<Point>, point2: DeepReadonly<Point>) {
  return point1.x === point2.x && point1.y === point2.y;
}

export function encodePoint(point: DeepReadonly<Point>) {
  return point.x + ',' + point.y;
}

export function decodePoint(value: string, int = false) {
  const [x, y] = value.split(',');
  const parse = int ? Number.parseInt : Number.parseFloat;
  return {
    x: parse(x),
    y: parse(y),
  };
}

export function invertPoint(point: DeepReadonly<Point>) {
  return { x: -point.x, y: -point.y };
}

export function addPoint(point1: DeepReadonly<Point>, point2: DeepReadonly<Point>) {
  return { x: point1.x + point2.x, y: point1.y + point2.y };
}

export function subtractPoint(point1: DeepReadonly<Point>, point2: DeepReadonly<Point>) {
  return addPoint(point1, invertPoint(point2));
}

export function assert(condition: boolean, errorMessage = 'Assertion failed!') {
  if (!condition) {
    throw new TypeError(errorMessage);
  }
}
export function arraysUnorderedEqual<T>(
  array1: ReadonlyArray<T>,
  array2: ReadonlyArray<T>,
  elementEqual: (arr1Elem: T, arr2Elem: T) => boolean = (a, b) => a === b
) {
  const foundIndexes = new Set<number>();
  return (
    array1.length === array2.length &&
    iterate(array1).every((el1) => {
      const index = array2.findIndex((el2, i) => !foundIndexes.has(i) && elementEqual(el1, el2));
      if (index < 0) {
        return false;
      }
      foundIndexes.add(index);
      return true;
    })
  );
}
