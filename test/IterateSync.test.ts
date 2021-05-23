import { IterateSync } from "../src/IterateSync.ts";
import { assertEquals } from "../src/3p/testing.ts";

Deno.test("It should chain in an expected way", () => {
  assertEquals(
    IterateSync.range(0, 15).stepBy(2).collect(),
    [0, 2, 4, 6, 8, 10, 12, 14],
  );
});

Deno.test("It should not mutate the initial iterable", () => {
  const initial = [1, 2, 3, 4];
  const result = IterateSync(initial).skip(2).collect();

  assertEquals(initial, [1, 2, 3, 4]);
  assertEquals(result, [3, 4]);
});

Deno.test("It should construct meaningful iterators", () => {
  const iterator = IterateSync.range(10, 20)
    .filter((_, idx) => idx % 2 === 0)
    .map((x) => String(x))
    .enumerate();

  assertEquals(
    iterator.collect(),
    [[0, "10"], [1, "12"], [2, "14"], [3, "16"], [4, "18"]],
  );
});
