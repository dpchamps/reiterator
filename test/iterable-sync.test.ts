import { assertEquals } from "../src/3p/testing.ts";
import { filter, map, reduce } from "../src/iterable-sync.ts";
import { collect, evaluate } from "../src/collect.ts";

Deno.test("It reduces primitive values", () => {
  const reducer = reduce(
    (acc, el) => acc + el,
    0,
  );

  assertEquals(evaluate(reducer([1, 2, 3])), 6);
});

Deno.test("It reduces rich values", () => {
  const reducer = reduce(
    (acc: Record<number, string>, el: string, idx) => ({ ...acc, [idx]: el }),
    {},
  );

  assertEquals(evaluate(reducer(["a", "b", "c"])), {
    0: "a",
    1: "b",
    2: "c",
  });
});

Deno.test("It maps iterables", () => {
  function* source() {
    let x = 0;
    while (x < 3) yield x++;
  }

  const mapped = map((x: number) => x * x);

  assertEquals(
    collect(mapped(source())),
    [0, 1, 4],
  );
});

Deno.test("It filters iterables", () => {
  const filtered = filter(
    (el: number) => el % 2 === 0,
  );

  assertEquals(
    collect(filtered([1, 2, 3, 4])),
    [2, 4],
  );
});

Deno.test("It collects into an appropriate value for empty filter", () => {
  const filtered = filter(
    (el: string | number): el is string => typeof el === "string",
  );

  assertEquals(
    collect(filtered([1, 2, 3, 4])),
    [],
  );
});
