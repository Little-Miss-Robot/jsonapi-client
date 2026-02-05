import { container } from './container';

export default function config() {
    return container().make('config');
}
