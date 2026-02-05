import type ResponseModel from '../ResponseModel';
import type ResultSet from '../ResultSet';
import type { TDataGateFunction } from '../types/data-gate-function';
import type { TFilterOperator } from '../types/filter-operator';
import type { TNullable } from '../types/generic/nullable';
import type { TQueryBuilderGroupingFunction } from '../types/query-builder-grouping-function';
import type { TQueryParams, TQueryParamValue } from '../types/query-params';
import type { TRawResponse } from '../types/raw-response';

export interface QueryBuilderInterface<T> {

    noCache: () => this
    cache: () => this
    setLocale: (locale: string) => this
    macro: (name: string, ...args: unknown[]) => this

    param: (name: string, value: TQueryParamValue) => this
    params: (params: TQueryParams) => this

    where: (path: string, operator: TFilterOperator, value: TNullable<TQueryParamValue>) => this
    whereIn: (path: string, values: string[] | number[]) => this
    whereNotIn: (path: string, values: string[] | number[]) => this
    whereIsNull: (path: string) => this
    whereIsNotNull: (path: string) => this

    include: (includes: string[]) => this
    limit: (amount: number) => this
    paginate: (page: number, perPage: number) => this
    sort: (path: string, direction: 'asc' | 'desc') => this
    group: (operator: 'or' | 'and', groupingCall: TQueryBuilderGroupingFunction<T>) => this

    get: () => Promise<ResultSet<T>>
    all: (batchSize?: number) => Promise<ResultSet<T>>

    getRaw: () => Promise<T | TRawResponse>
    find: (id: string) => Promise<T | ResponseModel>
    first: () => Promise<T | ResponseModel>

    gate: (gateFunction: TDataGateFunction) => this

    toString: () => string
}
