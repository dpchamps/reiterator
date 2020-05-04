import {
  takeN,
  count,
  enumerate,
  stepBy,
  range,
  repeat,
  cycle,
  chain,
} from "../src/iterators.ts";
import { testing } from "../deps.ts";

const { assertEquals } = testing;

Deno.test("takesN from iterator", () => {
  const base = [1, 2, 3, 4, 5, 6];

  assertEquals(
    Array.from(takeN(base[Symbol.iterator](), 3)),
    [1, 2, 3],
  );
});

Deno.test("takes n from an infinite iterator", () => {
  assertEquals(
    Array.from(takeN(count(), 4)),
    [0, 1, 2, 3],
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
  const enumerater = enumerate(count(1));
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
    Array.from(stepBy(takeN(count(), 15), 3)),
    [0, 3, 6, 9, 12],
  );
});

Deno.test("it should return a range", () => {
  assertEquals(
    Array.from(range(0, 10)),
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  );
});

Deno.test("it should repeat a value", () => {
  assertEquals(
    Array.from(takeN(repeat("abrakadabra"), 2)),
    ["abrakadabra", "abrakadabra"],
  );
});

Deno.test("it should cycle iterators", () => {
  assertEquals(
    Array.from(takeN(cycle("ABC"), 6)),
    ["A", "B", "C", "A", "B", "C"],
  );
});

Deno.test("chain -- It should chain multiple iterators", () => {
  assertEquals(
    Array.from(chain<string | number>([1, 2, 3, 4], "ABCD")),
    [1, 2, 3, 4, "A", "B", "C", "D"],
  );
});
