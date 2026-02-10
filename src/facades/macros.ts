import { container } from './container';

/**
 * Access the macro registry
 */
export default function macros() {
    return container().make('macros');
}
