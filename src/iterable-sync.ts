import {
  fromIterable,
  intoIterable,
  MapCallback,
  ReduceCallback,
  transpose,
  TypedIterable,
  wrap,
} from "./common.ts";
import { curry, pipe } from "./3p/ramda.ts";

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
