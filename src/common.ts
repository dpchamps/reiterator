export interface ReIterator<T, TReturn, TNext>
  extends Iterable<T>, Iterator<T, TReturn, TNext> {}
