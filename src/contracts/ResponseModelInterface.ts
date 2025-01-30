import type { TMapper } from '../types/mapper';

export interface ResponseModelInterface {
    get: (path: string | string[], defaultValue?: any) => any
    join: (separator: string, ...args: string[]) => string
    map: (path: string | string[], mapper?: TMapper<unknown>) => unknown
}
