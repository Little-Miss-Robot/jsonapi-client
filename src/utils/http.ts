import type { TQueryParams, TQueryParamValue } from '../types/query-params';

/**
 * Makes URLSearchParams from an object
 * @param params
 */
export function makeSearchParams(params: TQueryParams) {
    const searchParams = new URLSearchParams();
    const paramKeys = Object.keys(params);

    paramKeys.forEach((paramKey) => {
        if (Array.isArray(params[paramKey])) {
            params[paramKey].forEach((value, index) => {
                searchParams.append(`${paramKey}[${index + 1}]`, value);
            });
        }
        else {
            searchParams.append(paramKey, params[paramKey] as string);
        }
    });

    return searchParams;
}

/**
 * Deep-copies param values so source and target do not share references
 * @param source
 * @private
 */
export function cloneSearchParams(source: TQueryParams): TQueryParams {
    const out: TQueryParams = {};
    for (const key of Object.keys(source)) {
        const value = source[key];
        out[key] = Array.isArray(value) ? ([...value] as TQueryParamValue) : value;
    }
    return out;
}
