import {TNullable} from "../types/generic/nullable";

export interface ResponseModelInterface {
    get: <T>(path: string | string[], defaultValue?: TNullable<T>) => T
    hasOne: <T>(path: string | string[]) => Promise<T>
    hasMany: <T>(path: string | string[]) => Promise<T[]>
}
