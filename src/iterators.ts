import { ReIterator } from "./common.ts";

type TransformIteratorCallback<T, TReturn> = <U, UReturn>(
  result: IteratorResult<T, TReturn>,
) => IteratorResult<U, UReturn>;

export const pumpIter = <T, TReturn, TNext>(
  iter: Iterator<T, TReturn, TNext>,
) =>
  (times: number): Iterator<T, TReturn, TNext> => {
    while (times-- > 0) iter.next();
    return iter;
  };

export const transformIterator = <T>(
  iterator: Iterator<T, any, undefined>,
) =>
  <U, UReturn = any>(
    callback: TransformIteratorCallback<T, any>,
  ): ReIterator<U, UReturn, undefined> => ({
    [Symbol.iterator]() {
      return this;
    },
    next: (...args: [] | [any]) => callback(iterator.next(...args)),
  });

export const takeN = <T>(
  iterable: Iterable<T>,
  n: number,
): ReIterator<T, unknown, undefined> => {
  const iterator = iterable[Symbol.iterator]();
  let ticks = 0;
  return transformIterator(iterator)(({ value, done }) => {
    ticks += 1;
    return {
      value,
      done: ticks > n || done,
    };
  });
};

export const count = (
  start: number = 0,
): ReIterator<number, number, unknown> => ({
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
): ReIterator<[number, T], [number, T], unknown> => {
  let idx = 0;
  let iterator = iterable[Symbol.iterator]();

  return transformIterator(iterator)(
    ({ value, done }) => ({
      value: [idx++, value] as never,
      done,
    }),
  );
};

export const stepBy = <T>(
  iterable: Iterable<T>,
  step: number,
): ReIterator<T, T, unknown> => {
  const iterator = iterable[Symbol.iterator]();
  return {
    [Symbol.iterator]() {
      return this;
    },
    next(...args) {
      const result = iterator.next(...args as any);
      pumpIter(iterator)(step - 1);
      return result;
    },
  };
};

export const range = (start = 0, end = Infinity) =>
  takeN(count(start), end - start);

export const repeat = <T>(value: T): ReIterator<T, T, unknown> => ({
  [Symbol.iterator]() {
    return this;
  },
  next: () => ({
    value,
    done: false,
  }),
});

export const cycle = <T>(iterable: Iterable<T>): ReIterator<T, T, unknown> => {
  const iterator = iterable[Symbol.iterator]();
  const queue: any[] = [];

  return {
    [Symbol.iterator]() {
      return this;
    },
    next() {
      const { value, done } = iterator.next();

      done ? queue.unshift(queue.pop()) : queue.unshift(value);

      return {
        value: queue[0],
        done: false,
      };
    },
  };
};

export const chain = <T>(
  ...iterables: Iterable<T>[]
): ReIterator<T, T, unknown> => {
  const iterators = iterables.map((x) => x[Symbol.iterator]());
  const getNext = (): IteratorResult<T, T> => {
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
};

export const zip = <T>(
  ...iterables: Iterable<T>[]
): ReIterator<T[], T[], unknown> => {
  const iterators = iterables.map((x) => x[Symbol.iterator]());
  const zipNext = (): IteratorResult<T[], T[]> => {
    const value = iterators.map((i) => i.next()).reduce<T[]>(
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
};
