import {TQueryParams} from "../types/query-params";

export function makeSearchParams(params: TQueryParams) {

    const searchParams = new URLSearchParams();
    const paramKeys = Object.keys(params);

    paramKeys.forEach(paramKey => {
        if (Array.isArray(params[paramKey])) {
            params[paramKey].forEach((value, index) => {
                searchParams.append(`${paramKey}[${index+1}]`, value);
            });
        } else {
            searchParams.append(paramKey, params[paramKey] as string);
        }
    });

    return searchParams;
}
