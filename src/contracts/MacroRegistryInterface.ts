import type { QueryBuilderInterface } from '../contracts/QueryBuilderInterface';
import type { TQueryBuilderMacroFunction } from '../types/query-builder-macro-function';

export interface MacroRegistryInterface {
    /**
     * Registers a macro
     * @param name
     * @param call
     */
    register: (name: string, call: TQueryBuilderMacroFunction) => void

    /**
     * Executes a macro
     * @param name
     * @param query
     * @param args
     */
    execute: (name: string, query: QueryBuilderInterface<unknown>, args: unknown[]) => void
}
