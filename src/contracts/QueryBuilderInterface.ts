import type ResultSet from '../ResultSet';
import ResponseModel from "../ResponseModel";
import {TRawResponse} from "../types/raw-response";
import type {TQueryParams} from "../types/query-params";
import type {TFilterOperator} from "../types/filter-operator";
import {TQueryBuilderGroupingFunction} from "../types/query-builder-grouping-function";

export interface QueryBuilderInterface<T> {

    noCache: () => this;
    cache: () => this;
    setLocale: (locale: string) => this;
    macro: (name: string, ...args: unknown[]) => this;

    param: (name: string, value: string | number) => this;
    params: (params: TQueryParams) => this;

    where: (path: string, operator: TFilterOperator, value: string) => this;
    include: (includes: string[]) => this;
    limit: (amount: number) => this;
    paginate: (page: number, perPage: number) => this;
    sort: (path: string, direction: 'asc' | 'desc') => this;
    group: (operator: 'or' | 'and', groupingCall: TQueryBuilderGroupingFunction<T>) => this;

    get: () => Promise<ResultSet<T | ResponseModel>>;
    getRaw: () => Promise<T | TRawResponse>;
    find: (id: string) => Promise<T | ResponseModel>;
    first(): Promise<T | ResponseModel>;

    toString: () => string;
}
