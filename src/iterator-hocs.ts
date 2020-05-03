export type ReduceCallback<T, U> = (accumulator : U, currentItem : T, index : number) => U;

export type ForEachCallback<T> = (item : T, index : number) => void

export type MapCallback<T, U> = (item: T, index : number) => U;

export type FilterCallback<T> = (item : T, index : number) => unknown;

export type LensedFilterCallback<T, S extends T> = (item : T, index : number) => item is S;

const indexableIterator = <T>(iter : Iterable<T>) => 
    <U>(callback : (item : T, index : number) => U) => {
        let index = 0;

        return {
            [Symbol.iterator](){return this;},
            next(){
                const {value, done} = iter[Symbol.iterator]().next();

                return {
                    value: callback(value, index++),
                    done
                }
            }
        }
    }

export const reduceIterableSync =
    <T>(iterator : Iterable<T>) => 
        <U>(callback : ReduceCallback<T, U>, initialValue : U) => {
            let index = 0;
            let lastValue = initialValue;

            for(const value of iterator) { 
                lastValue = callback(lastValue, value, index++);
            }

           
            return lastValue
        }
    
       
export const forEachIterableSync = 
    <T>(iterator : Iterable<T>) =>
        (callback : ForEachCallback<T>) => {
            for(const _ of indexableIterator(iterator)(callback)){}
        }

export const mapIterableSync =
    <T>(iterator : Iterable<T>) => 
        <U>(callback : MapCallback<T, U>) => 
            indexableIterator(iterator)(callback);

export const filterIterableSync =
    <T>(iterator : Iterable<T>) =>
        <S extends T>(callback : FilterCallback<T> | LensedFilterCallback<T, S>) => {
            
            const indexable = indexableIterator(iterator)((item, idx) => 
                callback(item, idx)
                    ? item
                    : null
                )
            

            return {
                [Symbol.iterator](){return this},
                next(){
                    let result = indexable.next();
                    
                    while(result.value === null && !result.done) {
                        result = indexable.next();
                    }

                    return result as {value : S, done : boolean};
                }
            }
        }
   

// export const reduceIterableAsync =
//     <T>(iterator : AsyncIterable<T>) => 
//         async <U>(callback : ReduceCallback<T, U>, initialValue : U) => {
//             let index = 0;
//             let isTerminal = false;
//             let lastValue = initialValue;

//             for await (const item of iterator){
//                 lastValue = callback(lastValue, item, index++, () => isTerminal = true);
//                 if(isTerminal) break;
//             }

//             return lastValue;
//         }