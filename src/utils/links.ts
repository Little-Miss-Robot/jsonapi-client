import type { JsonApiLink } from '../types/json-api-response';
import { isJsonApiLinkObject } from '../typeguards/isJsonApiLinkObject';

export function getHref(link: JsonApiLink): string {
    if (!link) {
        return '';
    }

    if (typeof link === 'string') {
        return link;
    }
    else if (isJsonApiLinkObject(link)) {
        return link.href;
    }
}
