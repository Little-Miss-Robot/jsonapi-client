import type ResultSet from '../ResultSet';

export interface QueryBuilderInterface<T> {
    get: () => Promise<ResultSet<T>>
    getRaw: () => Promise<any>
    find: (id: string) => Promise<T>
}
