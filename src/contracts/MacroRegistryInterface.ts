import type { QueryBuilderInterface } from '../contracts/QueryBuilderInterface';
import type { TQueryBuilderMacroFunction } from '../types/query-builder-macro-function';

export interface MacroRegistryInterface {
    register: (name: string, call: TQueryBuilderMacroFunction) => any
    execute: (name: string, query: QueryBuilderInterface<unknown>, args: unknown[]) => any
}
