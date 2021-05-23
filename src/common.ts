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

export type LensedFilterCallback<T, S extends T> = (
  item: T,
  index: number,
) => item is S;

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

export const transpose = <T, U, UReturn, TReturn = any, TNext = undefined>(
  cb: (
    result: IteratorResult<T, TReturn>,
    iter: Iterator<T, TReturn, TNext>,
  ) => IteratorResult<U, UReturn>,
) =>
  (
    iter: Iterator<T, TReturn, TNext>,
  ) => ({
    next: (...args: [] | [TNext]) => cb(iter.next(...args), iter),
  });

export const wrap = <
  T,
  U,
  TReturn = any,
  TNext = undefined,
  UReturn = any,
  UNext = undefined,
>(
  fn: (iterator: Iterator<T, TReturn, TNext>) => Iterator<U, UReturn, UNext>,
) =>
  (iterable: TypedIterable<T, TReturn, TNext>) =>
    intoIterable(
      fn(
        fromIterable(iterable),
      ),
    );
