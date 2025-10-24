import type { TResultSetMeta } from './types/resultset-meta';
import {TNullable} from "./types/generic/nullable";
import Model from "./Model";
import {DataProperties} from "./types/generic/data-properties";

export default class ResultSet<T> implements Iterable<T> {

    /**
     * @private
     */
    private readonly items: T[] = [];

    /**
     *
     */
    public meta: TNullable<TResultSetMeta> = null;

    /**
     * @param initialItems
     */
    constructor(initialItems: T[] = []) {
        this.items = initialItems;
    }

    /**
     * @param meta
     */
    public setMeta(meta: TResultSetMeta) {
        this.meta = meta;
    }

    // Make the class iterable by implementing Symbol.iterator
    [Symbol.iterator](): Iterator<T> {
        let index = 0;
        const items = this.items;

        return {
            next(): IteratorResult<T> {
                if (index < items.length) {
                    return { value: items[index++], done: false };
                }
                else {
                    return { value: undefined as unknown as T, done: true };
                }
            },
        };
    }

    get length() {
        return this.items.length;
    }

    get(index: number): T {
        return this.items[index];
    }

    // Array-like methods, delegating to the internal array
    push(item: T): number {
        return this.items.push(item);
    }

    pop(): T | undefined {
        return this.items.pop();
    }

    map<U>(callback: (value: T, index: number, array: T[]) => U): U[] {
        return this.items.map(callback);
    }

    sort(compareFn?: (a: T, b: T) => number): T[] {
        this.items.sort(compareFn);
        return this.items;
    }

    forEach<U>(callback: (value: T, index: number, array: T[]) => U) {
        return this.items.forEach(callback);
    }

    filter(callback: (value: T, index: number, array: T[]) => boolean): T[] {
        return this.items.filter(callback);
    }

    find(callback: (value: T, index: number, array: T[]) => boolean): T | undefined {
        return this.items.find(callback);
    }

    reduce<U>(callback: (accumulator: U, currentValue: T, index: number, array: T[]) => U, initialValue: U): U {
        return this.items.reduce(callback, initialValue);
    }

    toArray(): T[] {
        return this.items;
    }

    concat(resultSet: ResultSet<T>): ResultSet<T> {

        const originalMeta = this.meta;
        const newMeta = resultSet.meta;

        const newResultSet = new ResultSet(this.toArray().concat(resultSet.toArray()));

        // Also concat the relevant meta
        newResultSet.setMeta({
            ...originalMeta,
            performance: {
                query: originalMeta.performance.query + newMeta.performance.query,
                mapping: originalMeta.performance.mapping + newMeta.performance.mapping,
            },
            excludedByGate: originalMeta.excludedByGate + newMeta.excludedByGate,
        });

        return newResultSet;
    }

    serialize(): Array<DataProperties<T>> {
        return this.items.map(item => {
            if (item instanceof Model) {
                return item.serialize();
            }
            return item;
        }) as Array<DataProperties<T>>;
    }
}
