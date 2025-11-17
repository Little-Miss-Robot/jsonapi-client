import Container from "../Container";
import type { TQueryBuilderMacroFunction } from "../types/query-builder-macro-function";

export function register(name: string, call: TQueryBuilderMacroFunction) {
    return Container.make('MacroRegistryInterface').register(name, call);
}