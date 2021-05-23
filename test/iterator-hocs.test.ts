import { testing } from "../deps.ts";
import {
  filterIterableSync,
  forEachIterableSync,
  mapIterableSync,
  reduceIterableSync,
} from "../src/iterator-hocs.ts";
import { count, take } from "../src/iterators.ts";
const { assertEquals } = testing;

const reduceFib = (
  [n1, n2, n3]: [number, number, number],
  _: any,
  x: number,
): [number, number, number] => {
  if (x === 0) return [x, 0, x];
  if (x === 1) return [n1, n2, x];

  return [
    n2,
    n3,
    n3 + n2,
  ];
};

function* fibGen() {
  let memo = [0, 1, 0];

  yield 0;
  yield 1;

  while (true) {
    memo[2] = memo[0] + memo[1];
    yield memo[2];
    memo[0] = memo[1];
    memo[1] = memo[2];
  }
}

Deno.test("It reduces an iterable to a value", () => {
  const iterableLike = Array(8);

  const reduce = reduceIterableSync(iterableLike)(reduceFib, [0, 0, 0]);

  assertEquals(
    reduce,
    [5, 8, 13],
  );
});

Deno.test("It maps values", () => {
  const mapFib = mapIterableSync(take(fibGen(), 5))(
    (el, idx) => el + idx,
  );

  assertEquals(
    Array.from(mapFib),
    [0, 2, 3, 5, 7],
  );
});

Deno.test("It filters an iterable", () => {
  const evenFib = filterIterableSync(take(fibGen(), 10))(
    (item: number): item is number => item % 2 === 0,
  );

  assertEquals(
    Array.from(evenFib),
    [0, 2, 8, 34],
  );
});

Deno.test("filterIterableSync - returns an empty array when no elements satisfy a condition", () => {
  assertEquals(
    Array.from(filterIterableSync(take(count(5), 5))((el) => el < 5)),
    [],
  );
});

Deno.test("Map/Filter/Reduce composition", () => {
  const baseIter = take(count(), 10);
  const sum = (a: number, b: number) => a + b;
  const square = (x: number) => x * x;
  const isOdd = (x: number) => (x / 2 | 0) !== (x / 2);

  const expectedResult = square(1) + square(3) + square(5) + square(7) +
    square(9);

  const composedIterator = mapIterableSync(
    filterIterableSync(baseIter)(isOdd),
  )(square);

  assertEquals(
    reduceIterableSync(composedIterator)(sum, 0),
    expectedResult,
  );
});

Deno.test("ForEach should consume the iterator", () => {
  const numbers = take(count(1), 10);
  let pointer = 0;
  forEachIterableSync(numbers)((item, index) => {
    assertEquals(item, pointer + 1);
    assertEquals(index, pointer);
    pointer += 1;
  });

  assertEquals(numbers.next().done, true);
});
