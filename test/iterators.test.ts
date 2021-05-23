import {
  chain,
  count,
  cycle,
  enumerate,
  range,
  repeat,
  stepBy,
  take,
  zip,
} from "../src/iterators.ts";

import { collect, evaluate } from "../src/collect.ts";
import { fromIterable } from "../src/common.ts";

import { testing } from "../deps.ts";

const { assertEquals } = testing;

Deno.test("takes from iterator", () => {
  const base = [1, 2, 3, 4, 5, 6];

  assertEquals(
    collect(take(base, 3)),
    [1, 2, 3],
  );
});

Deno.test("takes n from an infinite iterator", () => {
  function* bananas() {
    while (true) yield "bananas";
  }

  assertEquals(
    collect(take(bananas(), 2)),
    ["bananas", "bananas"],
  );
});

Deno.test("counts upwards indefinitely", () => {
  const counter = count();

  assertEquals(
    counter.next(),
    { value: 0, done: false },
  );

  assertEquals(
    counter.next(),
    { value: 1, done: false },
  );

  assertEquals(
    counter.next(),
    { value: 2, done: false },
  );
});

Deno.test("it enumerates", () => {
  const test = [{ x: "a" }, { y: "b" }];
  const enumerater = fromIterable(enumerate(count(1)));
  assertEquals(
    enumerater.next(),
    { value: [0, 1], done: false },
  );

  assertEquals(
    enumerater.next(),
    { value: [1, 2], done: false },
  );

  assertEquals(
    enumerater.next(),
    { value: [2, 3], done: false },
  );
});

Deno.test("it steps by a delta", () => {
  assertEquals(
    [...stepBy([0, 1, 2, 3, 4, 5, 6], 3)],
    [0, 3, 6],
  );
});

Deno.test("range -- it should return a range", () => {
  assertEquals(
    [...range(0, 10)],
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  );
});

Deno.test("range -- it should return a range not starting from zero", () => {
  assertEquals(
    [...range(5, 10)],
    [5, 6, 7, 8, 9],
  );
});

Deno.test("it should repeat a value", () => {
  const saysHello = repeat("hello");

  assertEquals(saysHello.next(), { value: "hello", done: false });
  assertEquals(saysHello.next(), { value: "hello", done: false });
});

Deno.test("it should cycle iterators", () => {
  assertEquals(
    Array.from(take(cycle("ABC"), 6)),
    ["A", "B", "C", "A", "B", "C"],
  );
});

Deno.test("it shouldn't cycle if nothing can be cycled", () => {
  assertEquals(
    [...take(cycle([]), 10)],
    [],
  );
});

Deno.test("chain -- It should chain multiple iterators", () => {
  const x = Array.from(chain([1, 2, 3, 4], "ABCD"));
  assertEquals(
    Array.from(chain([1, 2, 3, 4], "ABCD")),
    [1, 2, 3, 4, "A", "B", "C", "D"],
  );
});

Deno.test("zip -- It should zip mutiple iterators of equal length", () => {
  const i1 = range(0, 4);
  const i2 = "abcde";
  const i3 = range(2, 6);
  
  assertEquals(
    Array.from(zip(i1, i2, i3)),
    [[0, "a", 2], [1, "b", 3], [2, "c", 4], [3, "d", 5]],
  );
});
