import type { ResponseModelInterface } from './contracts/ResponseModelInterface';
import type Model from './Model';
import type { TNullable } from './types/generic/nullable';
import type { TModelClass } from './types/model-class';
import AutoMapper from './AutoMapper';
import { isResponseWithData } from './typeguards/isResponseWithData';
import { get } from './utils/object';

export default class ResponseModel implements ResponseModelInterface {
    /**
     * The raw, unprocessed response from the JSON:API
     * @private
     */
    private readonly rawResponse: unknown;

    /**
     * @param rawResponse
     */
    constructor(rawResponse: unknown) {
        this.rawResponse = rawResponse;
    }

    /**
     * Get the raw response from the ResponseModel
     */
    public getRawResponse(): unknown {
        return this.rawResponse;
    }

    /**
     * Gets a field from the node
     * @param path
     * @param defaultValue
     */
    get<T>(path: string | string[], defaultValue: T): T {
        return get(this.rawResponse as Record<string, unknown>, path, defaultValue);
    }

    /**
     * Gets a hasOne relationship
     * @param path
     * @param modelClass
     */
    async hasOne<T extends Model>(path: string | string[], modelClass?: TModelClass<T>): Promise<TNullable<T>> {
        let contentData: unknown = this.get(path, null);

        if (isResponseWithData(contentData)) {
            contentData = contentData.data;
        }

        if (!contentData) {
            return null;
        }

        const responseModel = new ResponseModel(contentData);

        // A class was explicitly given
        if (modelClass) {
            return await modelClass.createFromResponse(responseModel);
        }

        // Resort to automapping
        return await AutoMapper.map(responseModel);
    }

    /**
     * Gets a hasMany relationship
     * @param path
     * @param modelClass
     */
    async hasMany<T extends Model>(path: string | string[], modelClass?: TModelClass<T>): Promise<TNullable<T[]>> {
        let contentData: unknown = this.get(path, null);

        if (!contentData) {
            return null;
        }

        if (isResponseWithData(contentData)) {
            contentData = contentData.data;
        }

        if (Array.isArray(contentData)) {
            const result: T[] = [];

            for (const item of contentData) {
                const modelInstance = modelClass
                    ? await modelClass.createFromResponse(new ResponseModel(item))
                    : await AutoMapper.map(new ResponseModel(item));

                if (modelInstance) {
                    result.push(modelInstance);
                }
            }

            return result as T[];
        }

        return null;
    }
}
