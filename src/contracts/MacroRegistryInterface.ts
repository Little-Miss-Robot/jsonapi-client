import type { TQueryBuilderMacroFunction } from '../types/query-builder-macro-function';
import { QueryBuilderInterface } from "../contracts/QueryBuilderInterface";

export interface MacroRegistryInterface {
    register(name: string, call: TQueryBuilderMacroFunction);
    execute(name: string, query: QueryBuilderInterface<unknown>, args: unknown[]);
}
