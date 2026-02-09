import type { MacroRegistryInterface } from './contracts/MacroRegistryInterface';
import type { QueryBuilderInterface } from './contracts/QueryBuilderInterface';
import type { TQueryBuilderMacroFunction } from './types/query-builder-macro-function';
import UnknownMacroError from './errors/UnknownMacroError';

export default class MacroRegistry implements MacroRegistryInterface {
    /**
     * @private
     */
    private macros: Record<string, TQueryBuilderMacroFunction> = {};

    /**
     * Registers a new macro
     * @param name
     * @param call
     */
    public register(name: string, call: TQueryBuilderMacroFunction) {
        this.macros[name] = call;
    }

    /**
     * Executes a macro
     * @param name
     * @param query
     * @param args
     */
    public execute(name: string, query: QueryBuilderInterface<unknown>, args: unknown[] = []) {
        if (!this.macros[name]) {
            throw new UnknownMacroError(name);
        }

        this.macros[name].call(this, query, ...(args as []));
    }
}
