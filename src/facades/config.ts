import { container } from './container';

/**
 * Access the config
 */
export default function config() {
    return container().make('config');
}
