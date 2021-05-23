import {
  fromIterable,
  intoIterable,
  MapCallback,
  ReduceCallback,
  transpose,
  TypedIterable,
} from "./common.ts";
import { curry } from "./3p/ramda.ts";

const indexable = <T, TReturn = any, TNext = undefined>(
  iter: Iterator<T, TReturn, TNext>,
) =>
  <U>(cb: (el: T | TReturn, index: number, done?: boolean) => U, start = 0) =>
    transpose(iter)(({ value, done }) => ({
      value: cb(value, start++, done),
      done,
    }));

export const reduce = <T, TReturn = any, TNext = undefined>(
  iter: TypedIterable<T, TReturn, TNext>,
) =>
  <U>(callback: ReduceCallback<T | TReturn, U>, initialValue: U) =>
    intoIterable(
      indexable(fromIterable(iter))((el, idx, done) =>
        initialValue = done ? initialValue : callback(initialValue, el, idx)
      ),
    );

export const map = <T>(iter: Iterable<T>) =>
  <U>(callback: MapCallback<T, U>) =>
    intoIterable(
      indexable(
        fromIterable(iter),
      )(callback),
    );
