import type ResultSet from '../ResultSet';
import type { TDataGateFunction } from '../types/data-gate-function';
import type { TFilterOperator } from '../types/filter-operator';
import type { TNullable } from '../types/generic/nullable';
import type { TQueryBuilderGroupingFunction } from '../types/query-builder-grouping-function';
import type { TQueryParams, TQueryParamValue } from '../types/query-params';

export interface QueryBuilderInterface<T> {
    /**
     * Disables cache
     */
    noCache: () => this

    /**
     * Enables cache
     */
    cache: () => this

    /**
     * Sets the locale
     * @param locale
     */
    setLocale: (locale: string) => this

    /**
     * Executes a macro
     * @param name
     * @param args
     */
    macro: (name: string, ...args: unknown[]) => this

    /**
     * Registers a gate function, which is basically a client-side data filter
     * @param gateFunction
     */
    gate: (gateFunction: TDataGateFunction) => this

    /**
     * Adds a param
     * @param name
     * @param value
     */
    param: (name: string, value: TQueryParamValue) => this

    /**
     * Adds multiple params
     * @param params
     */
    params: (params: TQueryParams) => this

    /**
     * Adds a where filter
     * @param path
     * @param operator
     * @param value
     */
    where: (path: string, operator: TFilterOperator, value: TNullable<TQueryParamValue>) => this

    /**
     * Adds a whereIn filter
     * @param path
     * @param values
     */
    whereIn: (path: string, values: string[] | number[]) => this

    /**
     * Adds a whereNotIn filter
     * @param path
     * @param values
     */
    whereNotIn: (path: string, values: string[] | number[]) => this

    /**
     * Adds a whereIsNull filter
     * @param path
     */
    whereIsNull: (path: string) => this

    /**
     * Adds a whereIsNotNull filter
     * @param path
     */
    whereIsNotNull: (path: string) => this

    /**
     * Adds includes according to the JSON:API Include module
     * @param includes
     */
    include: (includes: string[]) => this

    /**
     * Limits the results to a certain amount
     * @param amount
     */
    limit: (amount: number) => this

    /**
     * Paginates the results
     * @param page
     * @param perPage
     */
    paginate: (page: number, perPage: number) => this

    /**
     * Sorts the results
     * @param path
     * @param direction
     */
    sort: (path: string, direction: 'asc' | 'desc') => this

    /**
     * Group certain operations (mostly filters) by operator (or | and)
     * @param operator
     * @param groupingCall
     */
    group: (operator: 'or' | 'and', groupingCall: TQueryBuilderGroupingFunction<T>) => this

    /**
     * Maps and returns all entries (paginated) in the response
     */
    get: () => Promise<ResultSet<T>>

    /**
     * Maps and returns all entries across all pages
     * @param batchSize
     */
    all: (batchSize?: number) => Promise<ResultSet<T>>

    /**
     * Fetches the endpoint and uses the raw response to pass to the mapper
     */
    getRaw: () => Promise<T>

    /**
     * Gets a single entry by UUID
     * @param id
     */
    find: (id: string) => Promise<T>

    /**
     * Gets and maps the first item from the query
     */
    first: () => Promise<T>

    /**
     * Generates as string from the QueryBuilder
     */
    toString: () => string
}
