import { normalizeMinus0 } from '../test-lib/lib';
import { DeepReadonly, Point } from '../app/types';
import { applyOffsets, getSurroundingCells, Orientation, rotatePoints } from './game';

describe('game models', () => {
  it('function ' + rotatePoints.name, () => {
    expect(
      normalizeMinus0(
        rotatePoints(
          [
            { x: 0, y: 0 },
            { x: 1, y: -1 },
            { x: 1, y: 2 },
          ],
          Orientation.Left,
          Orientation.Bottom
        )
      )
    ).toEqual([
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: -2, y: 1 },
    ]);
    expect(
      normalizeMinus0(
        rotatePoints(
          [
            { x: 0, y: 0 },
            { x: 1, y: 1 },
            { x: -2, y: 1 },
          ],
          Orientation.Bottom,
          Orientation.Left
        )
      )
    ).toEqual([
      { x: 0, y: 0 },
      { x: 1, y: -1 },
      { x: 1, y: 2 },
    ]);
    expect(
      normalizeMinus0(
        rotatePoints(
          [
            { x: 0, y: 0 },
            { x: 1, y: -1 },
            { x: 1, y: 2 },
          ],
          Orientation.Left,
          Orientation.Right
        )
      )
    ).toEqual([
      { x: 0, y: 0 },
      { x: -1, y: 1 },
      { x: -1, y: -2 },
    ]);
    expect(
      normalizeMinus0(
        rotatePoints(
          [
            { x: 0, y: 0 },
            { x: 1, y: -1 },
            { x: 1, y: 2 },
          ],
          Orientation.Right,
          Orientation.Left
        )
      )
    ).toEqual([
      { x: 0, y: 0 },
      { x: -1, y: 1 },
      { x: -1, y: -2 },
    ]);
    expect(
      normalizeMinus0(
        rotatePoints(
          [
            { x: 0, y: 0 },
            { x: 1, y: -1 },
            { x: 1, y: 2 },
          ],
          Orientation.Top,
          Orientation.Left
        )
      )
    ).toEqual([
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: -2, y: 1 },
    ]);
    expect(
      normalizeMinus0(
        rotatePoints(
          [
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 2, y: 0 },
            { x: 3, y: 0 },
          ],
          Orientation.Left,
          Orientation.Top
        )
      )
    ).toEqual([
      { x: 0, y: 0 },
      { x: 0, y: -1 },
      { x: 0, y: -2 },
      { x: 0, y: -3 },
    ]);
    expect(
      normalizeMinus0(
        rotatePoints(
          [
            { x: 0, y: 0 },
            { x: 0, y: 1 },
            { x: 0, y: 2 },
          ],
          Orientation.Bottom,
          Orientation.Right
        )
      )
    ).toEqual([
      { x: 0, y: 0 },
      { x: -1, y: 0 },
      { x: -2, y: 0 },
    ]);
    expect(
      normalizeMinus0(
        rotatePoints(
          [
            { x: 0, y: 0 },
            { x: 0, y: -1 },
          ],
          Orientation.Top,
          Orientation.Left
        )
      )
    ).toEqual([
      { x: 0, y: 0 },
      { x: 1, y: 0 },
    ]);
  });

  it('function ' + getSurroundingCells.name, () => {
    function compareAscByXY(point1: DeepReadonly<Point>, point2: DeepReadonly<Point>) {
      return point1.x !== point2.x ? point1.x - point2.x : point1.y - point2.y;
    }

    expect(
      getSurroundingCells([
        { x: 1, y: 2 },
        { x: 2, y: 2 },
        { x: 3, y: 2 },
      ]).sort(compareAscByXY)
    ).toEqual(
      [
        { x: 0, y: 1 },
        { x: 0, y: 2 },
        { x: 0, y: 3 },
        { x: 1, y: 1 },
        { x: 1, y: 3 },
        { x: 2, y: 1 },
        { x: 2, y: 3 },
        { x: 3, y: 1 },
        { x: 3, y: 3 },
        { x: 4, y: 1 },
        { x: 4, y: 2 },
        { x: 4, y: 3 },
      ].sort(compareAscByXY)
    );
    expect(getSurroundingCells([{ x: 0, y: 0 }]).sort(compareAscByXY)).toEqual(
      [
        { x: 0, y: 1 },
        { x: 1, y: 0 },
        { x: 1, y: 1 },
      ].sort(compareAscByXY)
    );
    expect(
      getSurroundingCells([
        { x: 9, y: 9 },
        { x: 9, y: 8 },
        { x: 9, y: 7 },
        { x: 9, y: 6 },
        { x: 9, y: 5 },
      ]).sort(compareAscByXY)
    ).toEqual(
      [
        { x: 8, y: 8 },
        { x: 8, y: 9 },
        { x: 8, y: 7 },
        { x: 8, y: 6 },
        { x: 8, y: 5 },
        { x: 8, y: 4 },
        { x: 9, y: 4 },
      ].sort(compareAscByXY)
    );
    expect(
      getSurroundingCells([
        { x: 4, y: 5 },
        { x: 5, y: 6 },
      ]).sort(compareAscByXY)
    ).toEqual(
      [
        { x: 3, y: 4 },
        { x: 3, y: 5 },
        { x: 3, y: 6 },
        { x: 4, y: 4 },
        { x: 4, y: 6 },
        { x: 5, y: 4 },
        { x: 5, y: 5 },
        { x: 4, y: 7 },
        { x: 5, y: 7 },
        { x: 6, y: 5 },
        { x: 6, y: 6 },
        { x: 6, y: 7 },
      ].sort(compareAscByXY)
    );
  });

  it('function ' + applyOffsets.name, () => {
    expect(
      applyOffsets({ x: 3, y: 4 }, [
        { x: 0, y: 0 },
        { x: 0, y: -1 },
      ])
    ).toEqual([
      { x: 3, y: 4 },
      { x: 3, y: 4 },
      { x: 3, y: 3 },
    ]);
    expect(
      applyOffsets(
        { x: 5, y: 2 },
        [
          { x: 0, y: 0 },
          { x: 0, y: 1 },
          { x: 0, y: 2 },
        ],
        true
      )
    ).toEqual([
      { x: 5, y: 2 },
      { x: 5, y: 2 },
      { x: 5, y: 3 },
      { x: 5, y: 4 },
    ]);
    expect(
      applyOffsets(
        { x: 3, y: 7 },
        [
          { x: 0, y: 0 },
          { x: 1, y: 0 },
          { x: 2, y: 0 },
          { x: 3, y: 0 },
        ],
        false
      )
    ).toEqual([
      { x: 3, y: 7 },
      { x: 4, y: 7 },
      { x: 5, y: 7 },
      { x: 6, y: 7 },
    ]);
  });
});
