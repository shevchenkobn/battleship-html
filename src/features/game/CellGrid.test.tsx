import { render, screen } from '@testing-library/react';
import assert from 'assert';
import { Point } from '../../app/types';
import { defaultBoardSize } from '../../models/game';
import { CellGrid, CellGridProps, defaultCellSize } from './CellGrid';

const tags = {
  container: 'div',
  column: 'div',
  cell: 'div',
};

const getTag = (node: Element) => node.localName;

// Queries from @testing-library, except ByTestId, cannot be used, because the component is not typical, text-less.
// Queries ByTestId from @testing-library can be used, but it requires undesirable code changes (updating cell's props ot accept the testid from parent).
// Therefore, DOM API is used.
/* eslint-disable testing-library/no-node-access */

/**
 * Not tested:
 * - props {@link CellGridProps.noHover}, {@link CellGridProps.style}: just styling;
 */
describe('renders square board', () => {
  test('default', () => {
    testGrid({ dimensions: defaultBoardSize });
  });

  test('default, small cell', () => {
    testGrid({ dimensions: defaultBoardSize, cellSizePx: 24 });
  });

  test('5x5', () => {
    testGrid({ dimensions: { x: 5, y: 5 } });
  });

  test('3x3, small cell', () => {
    testGrid({ dimensions: { x: 5, y: 5 }, cellSizePx: 12 });
  });

  test('5x1', () => {
    testGrid({ dimensions: { x: 5, y: 1 } });
  });

  test('2x1, small cell', () => {
    testGrid({ dimensions: { x: 2, y: 1 }, cellSizePx: 20 });
  });
});

describe('renders grid by points', () => {
  test('disconnected stuff', () => {
    testGrid(
      {
        points: [
          { x: -1, y: -2 },
          { x: 0, y: -2 },
          { x: 1, y: 0 },
        ],
      },
      { x: 3, y: 3 }
    );
  });

  test('connected stuff, small cell', () => {
    testGrid(
      {
        points: [
          { x: 1, y: 2 },
          { x: 2, y: 2 },
          { x: 2, y: 3 },
          { x: 2, y: 4 },
          { x: 3, y: 4 },
        ],
        cellSizePx: 25,
      },
      { x: 3, y: 3 }
    );
  });
});

function testGrid(props: CellGridProps, forceSize?: Point) {
  const { container } = render(<CellGrid {...props} />);

  const cellSizePx = (props.cellSizePx ?? defaultCellSize) + 'px';
  // We prefer not to reuse bounding rectangle algorithm, but it reduces the compehensiveness of the test.
  const dimensions = forceSize ?? ('dimensions' in props ? props.dimensions : null);
  assert(dimensions, 'Dimension must be provided either as a prop or 2nd argument!');
  const grid = container.children[0];
  const columns = Array.from(grid.children);
  expect(columns).toHaveLength(dimensions.x);
  expect(columns.map(getTag)).toEqual(Array(dimensions.x).fill(tags.column));
  const cellTags = Array(dimensions.y).fill(tags.cell);
  // const cells = [];
  let pointCount = 0;
  for (const element of columns) {
    const column = Array.from(element.children);
    // cells.push(column);
    expect(column).toHaveLength(dimensions.y);
    expect(column.map(getTag)).toEqual(cellTags);
    const cellsStyles = column.map((c) => window.getComputedStyle(c));
    for (const cellStyle of cellsStyles) {
      expect(cellStyle.width).toEqual(cellSizePx);
      expect(cellStyle.height).toEqual(cellSizePx);
      if (cellStyle.borderWidth) {
        pointCount += 1;
      }
    }
  }
  if ('points' in props) {
    // The only thing we can to test because we don't use bounding rectangle functions.
    expect(pointCount).toEqual(props.points.length);
  }
}
