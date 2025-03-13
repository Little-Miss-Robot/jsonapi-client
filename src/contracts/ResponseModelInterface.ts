import { TNullable } from "../types/generic/nullable";

export interface ResponseModelInterface {
	get: <T>(path: string | string[], defaultValue: T) => T;
	hasOne: <T>(path: string | string[]) => Promise<TNullable<T>>;
	hasMany: <T>(path: string | string[]) => Promise<TNullable<T[]>>;
}
