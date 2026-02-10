import { container } from './container';

/**
 * Makes a new client
 */
export default function client() {
    return container().make('client');
}
