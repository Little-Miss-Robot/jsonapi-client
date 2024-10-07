import { TMapper } from './types/mapper';
import AutoMapper from "./AutoMapper";

export default class ResponseModel {
    /**
     * The raw, unprocessed response from the JSON:API
     * @private
     */
    private readonly rawResponse: any;

    /**
     * @param rawResponse
     */
    constructor(rawResponse: any) {
        this.rawResponse = rawResponse;
    }

    /**
     * Return the type of the node
     */
    type(): string {
        if (!this.rawResponse.type) {
            return '';
        }

        return this.rawResponse.type;
    }

    /**
     * Returns the unique id of the node
     */
    id(): string {
        if (!this.rawResponse.id) {
            return '';
        }

        return this.rawResponse.id;
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
        for (let key of path) {
            result = result !== null && result.hasOwnProperty(key) ? result[key] : undefined;
            if (result === undefined) {
                return defaultValue;
            }
        }
        return result;
    }

    /**
     * Gets a relationship from the node and optionally map it
     * @param path
     * @param mapper
     */
    async map(path: string | string[], mapper?: TMapper<any>) {
        let contentData = this.get(path, null);

        if (!contentData) {
            return null;
        }

        if (contentData.data) {
            contentData = contentData.data;
        }

        if (Array.isArray(contentData)) {
            contentData = contentData.map((entry) => new ResponseModel(entry));

            let result = [];
            for await (const item of contentData) {
                result.push(AutoMapper.map(item));
            }

            return result;
        }

        const model = new ResponseModel(contentData);
        return AutoMapper.map(model);
    }
}
