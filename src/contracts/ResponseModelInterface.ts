import { TNullable } from "../types/generic/nullable";
import Model from "../Model";
import {TModelClass} from "../types/model-class";

export interface ResponseModelInterface {
	get: <T>(path: string | string[], defaultValue: T) => T;
	hasOne: <T extends Model>(path: string | string[], modelClass?: TModelClass<T>) => Promise<TNullable<T>>;
	hasMany: <T extends Model>(path: string | string[], modelClass?: TModelClass<T>) => Promise<TNullable<T[]>>;
}
