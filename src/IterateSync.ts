import * as Iterators from "./iterators.ts";
import * as Transformations from "./iterable-sync.ts";

import {
  FilterCallback,
  fromIterable,
  intoIterable,
  LensedFilterCallback,
  MapCallback,
  ReduceCallback,
  TypedIterable,
} from "./common.ts";
import { collect, evaluate } from "./collect.ts";

export const IterateSync = <T, TReturn = any, TNext = undefined>(
  initial?: TypedIterable<T, TReturn, TNext>,
) => {
  const iterator = fromIterable(initial || []);

  return {
    skip(times: number) {
      Iterators.skip(iterator, times);

      return this;
    },
    take: (n: number) => IterateSync(Iterators.take(intoIterable(iterator), n)),
    enumerate: () => IterateSync(Iterators.enumerate(intoIterable(iterator))),
    stepBy: (step: number) =>
      IterateSync(Iterators.stepBy(intoIterable(iterator), step)),
    cycle: () => IterateSync(Iterators.cycle(intoIterable(iterator))),
    collect: () => collect(intoIterable(iterator)),
    evaluate: () => evaluate(intoIterable(iterator)),
    map: <U>(cb: MapCallback<T, U>) =>
      IterateSync(Transformations.map(cb)(intoIterable(iterator))),
    reduce: <U>(cb: ReduceCallback<T, U>, initialValue: U) =>
      IterateSync(
        Transformations.reduce(cb, initialValue)(intoIterable(iterator)),
      ).collect(),
    filter: <U extends T>(cb: FilterCallback<T> | LensedFilterCallback<T, U>) =>
      IterateSync(Transformations.filter(cb)(intoIterable(iterator))),
    each: (cb: (el: T | TReturn, index: number) => void) =>
      IterateSync(Transformations.each(cb)(intoIterable(iterator))),
  };
};

IterateSync.repeat = <T>(value: T) => IterateSync(Iterators.repeat(value));
IterateSync.range = (start = 0, end = Infinity) => IterateSync(Iterators.range(start, end));
IterateSync.empty = () => IterateSync([]);
