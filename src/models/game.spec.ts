import { normalizeMinus0 } from '../test-lib/lib';
import { DeepReadonly, Point } from '../app/types';
import {
  applyOffset,
  getSurroundingCells,
  Direction,
  rotatePoints,
  tryPushFromEdges,
  getBoundingRectangle,
} from './game';

describe('game board functions', () => {
  it('function ' + rotatePoints.name, () => {
    expect(
      normalizeMinus0(
        rotatePoints(
          [
            { x: 0, y: 0 },
            { x: 1, y: -1 },
            { x: 1, y: 2 },
          ],
          Direction.Left,
          Direction.Bottom
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
          Direction.Bottom,
          Direction.Left
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
          Direction.Left,
          Direction.Right
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
          Direction.Right,
          Direction.Left
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
          Direction.Top,
          Direction.Left
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
          Direction.Left,
          Direction.Top
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
          Direction.Bottom,
          Direction.Right
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
          Direction.Top,
          Direction.Left
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

  it('function ' + applyOffset.name, () => {
    expect(
      applyOffset({ x: 3, y: 4 }, [
        { x: 0, y: 0 },
        { x: 0, y: -1 },
      ])
    ).toEqual([
      { x: 3, y: 4 },
      { x: 3, y: 4 },
      { x: 3, y: 3 },
    ]);
    expect(
      applyOffset(
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
      applyOffset(
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

  /**
   * Throwing is not tested because it is an exceptional behaviour.
   */
  it('function ' + tryPushFromEdges.name, () => {
    expect(
      tryPushFromEdges([
        { x: -3, y: 0 },
        { x: -2, y: 0 },
        { x: -1, y: 0 },
        { x: 0, y: 0 },
        { x: 1, y: 0 },
      ])
    ).toEqual([
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 3, y: 0 },
      { x: 4, y: 0 },
    ]);
    expect(
      tryPushFromEdges([
        { x: -6, y: 4 },
        { x: -5, y: 4 },
        { x: -4, y: 4 },
      ])
    ).toEqual([
      { x: 0, y: 4 },
      { x: 1, y: 4 },
      { x: 2, y: 4 },
    ]);
    expect(
      tryPushFromEdges([
        { x: 16, y: 10 },
        { x: 15, y: 10 },
        { x: 14, y: 10 },
      ])
    ).toEqual([
      { x: 9, y: 9 },
      { x: 8, y: 9 },
      { x: 7, y: 9 },
    ]);
    expect(
      tryPushFromEdges([
        { x: 13, y: -6 },
        { x: 13, y: -5 },
        { x: 13, y: -4 },
        { x: 13, y: -3 },
      ])
    ).toEqual([
      { x: 9, y: 0 },
      { x: 9, y: 1 },
      { x: 9, y: 2 },
      { x: 9, y: 3 },
    ]);
    expect(
      tryPushFromEdges([
        { x: -1, y: -1 },
        { x: 0, y: -1 },
        { x: -1, y: 0 },
        { x: 0, y: 0 },
      ])
    ).toEqual([
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
    ]);
  });

  it('function ' + getBoundingRectangle.name, () => {
    expect(getBoundingRectangle([{ x: 0, y: 0 }])).toEqual({
      topLeft: { x: 0, y: 0 },
      bottomRight: { x: 0, y: 0 },
    });
    expect(
      getBoundingRectangle([
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
      ])
    ).toEqual({
      topLeft: { x: 0, y: 0 },
      bottomRight: { x: 2, y: 0 },
    });
    expect(
      getBoundingRectangle([
        { x: 0, y: 0 },
        { x: 0, y: 1 },
        { x: 0, y: 2 },
        { x: 0, y: 3 },
      ])
    ).toEqual({
      topLeft: { x: 0, y: 0 },
      bottomRight: { x: 0, y: 3 },
    });
    expect(
      getBoundingRectangle([
        { x: 0, y: 0 },
        { x: 1, y: 1 },
        { x: 2, y: 2 },
      ])
    ).toEqual({
      topLeft: { x: 0, y: 0 },
      bottomRight: { x: 2, y: 2 },
    });
    expect(
      getBoundingRectangle([
        { x: -2, y: -2 },
        { x: -3, y: -1 },
        { x: 0, y: 0 },
        { x: 2, y: 1 },
        { x: 1, y: 2 },
      ])
    ).toEqual({
      topLeft: { x: -3, y: -2 },
      bottomRight: { x: 2, y: 2 },
    });
    expect(() => getBoundingRectangle([])).toThrow();
  });
});
