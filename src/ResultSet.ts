import {TResultSetMeta} from "./types/resultset-meta";

export default class ResultSet<T> implements Iterable<T> {

	private items: T[] = [];
	public meta: TResultSetMeta;

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
		let items = this.items;

		return {
			next(): IteratorResult<T> {
				if (index < items.length) {
					return { value: items[index++], done: false };
				} else {
					return { value: undefined as unknown as T, done: true };
				}
			}
		};
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
}
