import {
  FilterCallback,
  ForEachCallback,
  indexableIterable,
  MapCallback,
  ReduceCallback,
} from "./common";
export type LensedFilterCallback<T, S extends T> = (
  item: T,
  index: number,
) => item is S;

export const reduceIterableSync = <T>(iterator: Iterable<T>) =>
  <U>(callback: ReduceCallback<T, U>, initialValue: U) => {
    let index = 0;
    let lastValue = initialValue;

    for (const value of iterator) {
      lastValue = callback(lastValue, value, index++);
    }

    return lastValue;
  };

export const forEachIterableSync = <T>(iterator: Iterable<T>) =>
  (callback: ForEachCallback<T>) => {
    for (const _ of indexableIterable(iterator)(callback)) {}
  };

export const mapIterableSync = <T>(iterator: Iterable<T>) =>
  <U>(callback: MapCallback<T, U>) => indexableIterable(iterator)(callback);

export const filterIterableSync = <T>(iterator: Iterable<T>) =>
  <S extends T>(callback: FilterCallback<T> | LensedFilterCallback<T, S>) => {
    const indexable = indexableIterable(iterator)((item, idx) =>
      callback(item, idx) ? item : null
    );

    return {
      [Symbol.iterator]() {
        return this;
      },
      next() {
        let result = indexable.next();

        while (result.value === null && !result.done) {
          result = indexable.next();
        }

        return result as { value: S; done: boolean };
      },
    };
  };
