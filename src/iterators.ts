import { transpose, TypedIterable, wrap } from "./common.ts";

export const skip = <T, TReturn = any, TNext = undefined>(
  iter: Iterator<T, TReturn, TNext>,
  times: number,
) => {
  while (times-- > 0) iter.next();

  return iter;
};

export const take = <T>(
  iterable: Iterable<T>,
  n: number,
) =>
  wrap<T, T>(
    transpose<T, T, any>(({ value, done }) => ({
      value,
      done: done || n-- <= 0,
    })),
  )(iterable);

export const count = (
  start: number = 0,
) => ({
  [Symbol.iterator]() {
    return this;
  },
  next: () => ({
    value: start++,
    done: false,
  }),
});

export const enumerate = <T>(
  iterable: Iterable<T>,
  idx = 0,
) =>
  wrap<T, [number, T]>(
    transpose(
      ({ value, done }) => ({
        value: [idx++, value],
        done,
      }),
    ),
  )(iterable);

export const stepBy = <T>(
  iterable: Iterable<T>,
  step: number,
) =>
  wrap<T, T>(
    transpose(
      ({ value, done }, iter) => {
        skip(iter, step - 1);

        return {
          value,
          done,
        };
      },
    ),
  )(iterable);

export const range = (start = 0, end = Infinity) =>
  take(count(start), end - start);

export const repeat = <T>(value: T): IterableIterator<T> => ({
  [Symbol.iterator]() {
    return this;
  },
  next: () => ({
    value,
    done: false,
  }),
});

export const cycle = <T>(iterable: Iterable<T>): IterableIterator<T> => {
  const iterator = iterable[Symbol.iterator]();
  const queue: T[] = [];

  return {
    [Symbol.iterator]() {
      return this;
    },
    next() {
      const { value, done } = iterator.next();

      if (done && queue.length === 0) {
        return {
          value: undefined,
          done: true,
        };
      }

      done ? queue.unshift(queue.pop()!) : queue.unshift(value);

      return {
        value: queue[0],
        done: false,
      };
    },
  };
};

export function chain<T>(a: Iterable<T>): IterableIterator<T>;
export function chain<T, U>(
  a: Iterable<T>,
  b: Iterable<U>,
): IterableIterator<T | U>;
export function chain<T, U, V>(
  a: Iterable<T>,
  b: Iterable<U>,
  c: Iterable<V>,
): IterableIterator<T | U | V>;
export function chain<T, U, V, W>(
  a: Iterable<T>,
  b: Iterable<U>,
  c: Iterable<V>,
  d: Iterable<W>,
): IterableIterator<T | U | V | W>;
export function chain<T, U, V, W, X>(
  a: Iterable<T>,
  b: Iterable<U>,
  c: Iterable<V>,
  d: Iterable<W>,
  e: Iterable<X>,
): IterableIterator<T | U | V | W | X>;

export function chain(...iterables: any[]): IterableIterator<any> {
  const iterators = iterables.map((x) => x[Symbol.iterator]());
  const getNext = (): any => {
    const { value, done } = iterators[0].next();
    if (done) {
      iterators.shift();
      return iterators.length
        ? getNext()
        : { value: undefined as never, done: true };
    }

    return { value, done };
  };

  return {
    [Symbol.iterator]() {
      return this;
    },
    next() {
      return getNext();
    },
  };
}

export function zip<T>(a: Iterable<T>): IterableIterator<T>;
export function zip<T, U>(
  a: Iterable<T>,
  b: Iterable<U>,
): IterableIterator<T | U>;
export function zip<T, U, V>(
  a: Iterable<T>,
  b: Iterable<U>,
  c: Iterable<V>,
): IterableIterator<T | U | V>;
export function zip<T, U, V, W>(
  a: Iterable<T>,
  b: Iterable<U>,
  c: Iterable<V>,
  d: Iterable<W>,
): IterableIterator<T | U | V | W>;
export function zip<T, U, V, W, X>(
  a: Iterable<T>,
  b: Iterable<U>,
  c: Iterable<V>,
  d: Iterable<W>,
  e: Iterable<X>,
): IterableIterator<T | U | V | W | X>;

export function zip(
  ...iterables: any[]
): IterableIterator<any> {
  const iterators = iterables.map((x) => x[Symbol.iterator]());
  const zipNext = (): IteratorResult<any> => {
    const value = iterators.map((i) => i.next()).reduce<any>(
      (acc, { value, done }) => {
        return done ? acc : [...acc, value];
      },
      [],
    );

    return {
      value,
      done: value.length === 0,
    };
  };

  return {
    [Symbol.iterator]() {
      return this;
    },
    next: () => zipNext(),
  };
}
