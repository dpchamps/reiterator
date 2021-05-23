import { assertEquals } from "../src/3p/testing.ts";
import { map, reduce } from "../src/iterable-sync.ts";
import { collect, evaluate } from "../src/collect.ts";
import { fromIterable, intoIterable } from "../src/common.ts";

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
