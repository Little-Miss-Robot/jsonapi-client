import {container} from "./container";

export default function macros() {
    return container().make('MacroRegistryInterface');
}