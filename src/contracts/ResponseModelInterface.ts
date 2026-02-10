import type Model from '../Model';
import type { TNullable } from '../types/generic/nullable';
import type { TModelClass } from '../types/model-class';

export interface ResponseModelInterface {
    /**
     * Gets the raw, unprocessed response
     */
    getRawResponse: () => unknown

    /**
     * Gets a property from the response while providing a default
     * @param path
     * @param defaultValue
     */
    get: <T>(path: string | string[], defaultValue: T) => T

    /**
     * Gets a hasOne relationship
     * @param path
     * @param modelClass
     */
    hasOne: <T extends Model>(path: string | string[], modelClass?: TModelClass<T>) => Promise<TNullable<T>>

    /**
     * Gets a hasMany relationship
     * @param path
     * @param modelClass
     */
    hasMany: <T extends Model>(path: string | string[], modelClass?: TModelClass<T>) => Promise<TNullable<T[]>>
}
