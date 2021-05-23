import { assertEquals } from "../src/3p/testing.ts";
import { reduce, map } from "../src/iterable-sync.ts";
import { collect, evaluate } from "../src/collect.ts";
import { fromIterable, intoIterable } from "../src/common.ts";

Deno.test("It reduces primitive values", () => {
  const reducer = reduce([1, 2, 3])(
    (acc, el) => acc + el,
    0,
  );

  assertEquals(evaluate(reducer), 6);
});

Deno.test("It reduces rich values", () => {
    const reducer = reduce(["a", "b", "c"])(
        (acc, el, idx) => ({...acc, [idx]: el}),
        {}
    )
    
    assertEquals(evaluate(reducer), {
        0: "a",
        1: "b",
        2: "c"
    });
});

Deno.test("It maps iterables", () => {
    function* source(){
        let x = 0;
        while(x < 3) yield x++;
    }

    const mapped = map(source())((x) => x*x);

    assertEquals(
        collect(mapped),
        [0, 1, 4]
    );
})
