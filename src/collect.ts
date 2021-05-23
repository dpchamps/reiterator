import { fromIterable } from "./common.ts";

export const collect = <T>(iterator: Iterable<T>) => Array.from(iterator);

export const evaluate = <T>(iter: Iterable<T>): T => {
  const iterator = fromIterable(iter);
  let result = iterator.next();
  while (!result.done) result = iterator.next();

  return result.value;
};
