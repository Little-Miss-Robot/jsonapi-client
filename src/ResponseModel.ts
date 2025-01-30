import type { ResponseModelInterface } from './contracts/ResponseModelInterface';
import type { TMapper } from './types/mapper';
import AutoMapper from './AutoMapper';

export default class ResponseModel implements ResponseModelInterface {
    /**
     * The raw, unprocessed response from the JSON:API
     * @private
     */
    private readonly rawResponse: Object;

    /**
     * @param rawResponse
     */
    constructor(rawResponse: Object) {
        this.rawResponse = rawResponse;
    }

    /**
     * Gets a field from the node
     * @param path
     * @param defaultValue
     */
    get(path: string | string[], defaultValue?: any): any {
        if (!Array.isArray(path)) {
            path = path.replace(/\[(\d+)\]/g, '.$1').split('.');
        }

        let result = this.rawResponse;
        for (const key of path) {
            result = result !== null && Object.prototype.hasOwnProperty.call(result, key) ? result[key] : undefined;
            if (result === undefined) {
                return defaultValue;
            }
        }

        return result;
    }

    /**
     * @param path
     * @param customMapper
     */
    custom(path: string | string[], customMapper: (value: any) => any) {
        return customMapper(this.get(path));
    }

    /**
     * @param separator
     * @param args
     */
    join(separator: string, ...args: (string | string[])[]): string {
        // @TODO test this functionality
        return args.map((path) => {
            return this.get(path, '');
        }).filter(value => value !== '').join(separator);
    }

    /**
     * Gets a relationship from the node and optionally map it
     * @param path
     * @param mapper
     */
    async map(path: string | string[], mapper?: TMapper<unknown>) {
        let contentData = this.get(path, null);

        if (!contentData) {
            return null;
        }

        if (contentData.data) {
            contentData = contentData.data;
        }

        if (Array.isArray(contentData)) {
            const result = [];

            for await (const item of contentData) {
                const responseModel = new ResponseModel(item);
                result.push(AutoMapper.map(responseModel));
            }

            return result;
        }

        return AutoMapper.map(new ResponseModel(contentData));
    }
}
