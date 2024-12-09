export function makeQueryParams(params: Record<string, string | number>) {
    const str = [];
    for (const param in params) {
        if (Object.prototype.hasOwnProperty.call(params, param)) {
            str.push(`${encodeURIComponent(param)}=${params[param]}`);
        }
    }
    return str.join('&');
}
