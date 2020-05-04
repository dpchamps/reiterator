import { ReIterator } from "./common.ts";

/**
 * Bummer!
 * Tons of open issues in TS-land around typing iterators. Can't tell if I'm a dummy of typescript if failing me:
 * 
 * https://github.com/microsoft/TypeScript/issues/31214
 * https://github.com/microsoft/TypeScript/issues/32890
 * https://github.com/microsoft/TypeScript/issues/32728
 */

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

export const transformIterator = <T, TReturn, TNext>(
  iterator: Iterator<T, TReturn, TNext>,
) =>
  <U extends T, UReturn extends TReturn, UNext>(
    callback: TransformIteratorCallback<T, TReturn>,
    //@ts-ignore
  ): ReIterator<U, UReturn, UNext> => ({
    [Symbol.iterator]() {
      return this;
    },
    next: (...args: [] | [any]) => callback(iterator.next(...args)),
  });

export const takeN = <T>(
  iterable: Iterable<T>,
  n: number,
): ReIterator<T, T, T> => {
  const iterator = iterable[Symbol.iterator]();
  let ticks = 0;
  // @ts-ignore
  return transformIterator(iterator)(({ value, done }) => {
    ticks += 1;
    return {
      value: value,
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

  //@ts-ignore
  return transformIterator(iterator)(
    ({ value, done }) => ({
      //@ts-ignore
      value: [idx++, value],
      done,
    }),
  );
};

export const stepBy = <T>(
  iterable: Iterable<T>,
  step: number,
): ReIterator<T, T, unknown> => {
  const iterator = iterable[Symbol.iterator]();
  //@ts-ignore
  return {
    [Symbol.iterator]() {
      return this;
    },
    next(...args) {
      //@ts-ignore
      const result = iterator.next(...args);
      pumpIter(iterator)(step - 1);
      return result;
    },
  };
};

export const range = (start: 0, end = Infinity) => takeN(count(start), end);

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
    //@ts-ignore
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

export const chain = <T extends any>(
  ...iterables: Iterable<T>[]
): ReIterator<T, T, unknown> => {
  const iterators = iterables.map((x) => x[Symbol.iterator]());
  const getNext = (): IteratorResult<T, T> => {
    const { value, done } = iterators[0].next();
    if (done) {
      iterators.shift();
      return iterators.length
        ? getNext()
        : { value: undefined as unknown as any, done: true };
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
