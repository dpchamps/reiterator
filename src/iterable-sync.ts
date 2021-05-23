import {
  FilterCallback,
  LensedFilterCallback,
  MapCallback,
  ReduceCallback,
  transpose,
  wrap,
} from "./common.ts";

export const indexable = <T, U, TReturn = any>(
  cb: (el: T | TReturn, index: number, done?: boolean) => U,
  start = 0,
) =>
  transpose(({ value, done }) => ({
    value: cb(value, start++, done),
    done,
  }));

export const reduce = <T, U, TReturn = any>(
  callback: ReduceCallback<T | TReturn, U>,
  initialValue: U,
) =>
  wrap<T, U, TReturn>(
    indexable((el, idx, done) =>
      initialValue = done ? initialValue : callback(initialValue, el, idx)
    ),
  );

export const map = <T, U>(callback: MapCallback<T, U>) =>
  wrap<T, U>(indexable(callback));

const ITER_SKIP = Symbol();

export const filter = <T, U extends T>(
  callback: FilterCallback<T> | LensedFilterCallback<T, U>,
) =>
  wrap<T, U>(
    (iter) => {
      const _indexable = indexable(
        (el, index) => callback(el, index) ? el : ITER_SKIP,
      )(iter);

      return {
        next: () => {
          let result = _indexable.next();

          while (result.value === ITER_SKIP && !result.done) {
            result = _indexable.next();
          }

          if (result.value === ITER_SKIP) {
            return {
              value: null,
              done: true,
            };
          }

          return {
            value: result.value,
            done: result.done,
          };
        },
      };
    },
  );
