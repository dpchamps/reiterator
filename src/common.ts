export interface ReIterator<T, TReturn, TNext>
  extends Iterable<T>, Iterator<T, TReturn, TNext> {}

export type TypedIterable<T, TReturn, TNext> = {
  [Symbol.iterator](): Iterator<T, TReturn, TNext>;
};

export type ReduceCallback<T, U> = (
  accumulator: U,
  currentItem: T,
  index: number,
) => U;

export type ForEachCallback<T> = (item: T, index: number) => void;

export type MapCallback<T, U> = (item: T, index: number) => U;

export type FilterCallback<T> = (item: T, index: number) => unknown;

export const fromIterable = <T, TReturn = any, TNext = undefined>(
  iterable: TypedIterable<T, TReturn, TNext>,
) => iterable[Symbol.iterator]();

export const intoIterable = <T, TReturn = any, TNext = undefined>(
  iterator: Iterator<T, TReturn, TNext>,
): TypedIterable<T, TReturn, TNext> => ({
  [Symbol.iterator]: () => ({
    next: (...args: [] | [TNext]) => iterator.next(...args),
  }),
});

export const transpose = <T, TReturn = any, TNext = undefined>(
  iter: Iterator<T, TReturn, TNext>,
) =>
  <U, UReturn>(
    cb: (result: IteratorResult<T, TReturn>) => IteratorResult<U, UReturn>,
  ) => ({
    next: (...args: [] | [TNext]) => cb(iter.next(...args)),
  });
