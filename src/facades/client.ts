import {container} from "./container";

export default function client() {
    return container().make('ClientInterface');
}