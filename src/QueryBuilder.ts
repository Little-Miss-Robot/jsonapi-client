import Client from './Client';
import ResponseModel from './ResponseModel';
import { TMapper } from './types/mapper';
import {makeQueryParams} from './utils/http';
import {QueryBuilderInterface} from "./contracts/QueryBuilderInterface";

/**
 * This class provides an easy-to-use interface to build queries
 * specifically for JSON:API
 */
export default class QueryBuilder<T> implements QueryBuilderInterface {
    /**
     * The locale in which we're going to query the entries
     * @private
     */
    private locale?: string;

    /**
     * The mapping function to use when we received the response
     * @private
     */
    private readonly client: Client;

    /**
     * The mapping function to use when we received the response
     * @private
     */
    private readonly mapper: TMapper<T>;

    /**
     * @private
     */
    private readonly endpoint: string;

    /**
     * The registered query params
     * @private
     */
    private readonly queryParams: Record<string, string | number>;

    /**
     * The cache policy to pass to the Client once the query executes
     * @private
     */
    private cachePolicy: 'force-cache' | 'no-store' = 'force-cache';

    /**
     *
     * @private
     */
    private rawResponse: any;

    /**
     * The last used filter group id, increments with each use of a filter-method to generate a unique filter group name
     * @private
     */
    private lastFilterGroupId: number = 0;

    /**
     * @param client
     * @param endpoint
     * @param mapper
     */
    constructor(client: Client, endpoint: string, mapper: TMapper<T>) {
        this.client = client;
        this.endpoint = endpoint;
        this.mapper = mapper;
        this.queryParams = {};
        this.param('jsonapi_include', 1);
    }

    /**
     * Disabled caching on the request
     */
    noCache() {
        this.cachePolicy = 'no-store';
        return this;
    }

    /**
     * Forces caching on the request
     */
    cache() {
        this.cachePolicy = 'force-cache';
        return this;
    }

    /**
     * Sets the locale of the query
     * @param locale
     */
    setLocale(locale: string) {
        this.locale = locale;
        return this;
    }

    /**
     * Registers one query param
     * @param name
     * @param value
     */
    param(name: string, value: string | number) {
        this.queryParams[name] = value;
        return this;
    }

    /**
     * Registers multiple query params
     * @param params
     */
    params(params: Record<string, string>) {
        Object.keys(params).forEach((key) => {
            this.param(key, params[key]);
        });
        return this;
    }

    /**
     * Registers includes (as described by JSON:API)
     * @param includes
     */
    include(includes: string[]) {
        this.param('include', includes.join(','));
        return this;
    }

    /**
     * @param amount
     */
    limit(amount: number) {
        this.param('page[limit]', amount);
        return this;
    }

    /**
     * @param key
     * @param value
     */
    filter(key: string, value: string) {
        this.param(`filter[${key}]`, value);
        return this;
    }

    /**
     *
     */
    gtFilter(path: string, value: string) {
        this.param('filter[dateFrom][condition][path]', path);
        this.param('filter[dateFrom][condition][operator]', '>');
        this.param('filter[dateFrom][condition][value]', value);

        return this;
    }

    /**
     * @param path
     * @param direction
     */
    sort(path: string, direction: 'asc' | 'desc' = 'asc') {
        const groupName = this.createFilterGroupName();
        this.param(`sort[${groupName}][path]`, path);
        this.param(`sort[${groupName}][direction]`, direction);

        return this;
    }

    /**
     * @param path
     * @param value
     */
    orFilter(path: string, value: string | string[]) {
        const groupName = this.createFilterGroupName();

        if (Array.isArray(value)) {
            // Create a unique group for the OR condition
            this.param(`filter[${groupName}_group][group][conjunction]`, 'OR');

            value.forEach((v, index) => {
                this.param(`filter[${groupName}_${index}][condition][path]`, path);
                this.param(`filter[${groupName}_${index}][condition][value]`, v);
                this.param(`filter[${groupName}_${index}][condition][memberOf]`, `${groupName}_group`);
            });
        } else {
            this.param(`filter[${groupName}][condition][path]`, path);
            this.param(`filter[${groupName}][condition][value]`, value);
        }

        return this;
    }

    /**
     * @param page
     * @param perPage
     */
    paginate(page: number, perPage: number) {
        this.param('page[offset]', Math.max(page - 1, 0) * perPage);
        this.limit(perPage);

        return this;
    }

    /**
     * @private
     */
    private createFilterGroupName(): string {
        this.lastFilterGroupId = this.lastFilterGroupId + 1;

        return `g${this.lastFilterGroupId}`;
    }

    /**
     * @param path
     * @private
     */
    private buildUrl(path: string): string {
        return `${this.locale ? this.locale + '/' : ''}${path}/?${makeQueryParams(this.queryParams)}`;
    }

    /**
     * Executes the query (GET)
     */
    private async performGetRequest(path: string) {
        return await this.client.get(this.buildUrl(path), {
            cache: this.cachePolicy
        });
    }

    /**
     * Fetches the endpoint and returns the raw response without automatically mapping it to a response model
     */
    async getRaw(): Promise<T> {
        const response = await this.performGetRequest(this.endpoint);

        if (!this.mapper) {
            return response;
        }

        return await this.mapper(response);
    }

    /**
     * Maps and returns all entries in the response
     */
    async getAll(): Promise<T[]> {
        this.rawResponse = await this.performGetRequest(this.endpoint);

        if (typeof this.rawResponse.data === 'undefined') {
            console.error(this.buildUrl(this.endpoint), this.rawResponse.errors[0].detail);
            return [];
        }

        const responseModels = this.rawResponse.data.map((entry: any) => new ResponseModel(entry));

        if (!this.mapper) {
            return responseModels;
        }

        let result = [];
        for await (const item of responseModels) {
            const mapped = await this.mapper(item);
            result.push(mapped);
        }

        return result;
    }

    /**
     * Gets a single entry by UUID
     * @param uuid
     */
    async getById(uuid: string): Promise<T> {
        this.rawResponse = await this.performGetRequest(`${this.endpoint}/${uuid}`);

        if (!this.mapper) {
            throw new Error('Mapper not defined');
        }

        if (typeof this.rawResponse.data === 'undefined') {
            console.error(this.buildUrl(this.endpoint), this.rawResponse.errors[0].detail);
        }

        return this.mapper(new ResponseModel(this.rawResponse.data));
    }

    /**
     *
     */
    public getCount() {
        return this.rawResponse.meta.count;
    }

    /**
     *
     * @param perPage
     */
    public getPageCount(perPage: number) {
        return Math.ceil(this.rawResponse.meta.count / perPage);
    }

    /**
     *
     */
    public toString() {
        return this.buildUrl(this.endpoint);
    }
}
