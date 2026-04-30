export function get<T>(object: Record<string, unknown>, path: string | string[], defaultValue: T): T {
    if (!Array.isArray(path)) {
        path = path.replace(/\[(\d+)\]/g, '.$1').split('.');
    }

    let result = object as Record<string, any>;

    for (const key of path) {
        result = Object.prototype.hasOwnProperty.call(result, key) ? result[key] : undefined;
        if (result === undefined || result === null) {
            return defaultValue;
        }
    }

    return result as T;
}
