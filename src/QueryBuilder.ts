import Client from './Client';
import ResponseModel from './ResponseModel';
import { TMapper } from './types/mapper';
import {makeQueryParams} from './utils/http';
import {QueryBuilderInterface} from "./contracts/QueryBuilderInterface";
import {TNullable} from "./types/nullable";
import {TFilterOperator} from "./types/filter-operator";
import MacroRegistry from "./MacroRegistry";

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
    private readonly mapper: TMapper<Promise<T>>;

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
     *
     * @private
     */
    private currentFilterGroupName: TNullable<string>;

    /**
     * @param client
     * @param endpoint
     * @param mapper
     */
    constructor(client: Client, endpoint: string, mapper: TMapper<Promise<T>>) {
        this.client = client;
        this.endpoint = endpoint;
        this.mapper = mapper;
        this.queryParams = {};
        this.param('jsonapi_include', 1);
    }

    /**
     * Executes a macro registered on MacroRegistry
     * @param name
     * @param args
     */
    public macro(name: string, ...args): this {
        MacroRegistry.execute(name, this, args);
        return this;
    }

    /**
     * Disabled caching on the request
     */
    public noCache(): this {
        this.cachePolicy = 'no-store';
        return this;
    }

    /**
     * Forces caching on the request
     */
    public cache(): this {
        this.cachePolicy = 'force-cache';
        return this;
    }

    /**
     * Sets the locale of the query
     * @param locale
     */
    public setLocale(locale: string): this {
        this.locale = locale;
        return this;
    }

    /**
     * Registers one query param
     * @param name
     * @param value
     */
    public param(name: string, value: string | number): this {
        this.queryParams[name] = value;
        return this;
    }

    /**
     * Registers multiple query params
     * @param params
     */
    public params(params: Record<string, string>): this {
        Object.keys(params).forEach((key) => {
            this.param(key, params[key]);
        });
        return this;
    }

    /**
     * @param path
     * @param operator
     * @param value
     */
    public where(path: string, operator: TFilterOperator, value: string): this {

        if (operator === '=' && ! this.currentFilterGroupName) {
            this.param(`filter[${path}]`, value);
            return this;
        }

        const groupName = this.createFilterGroupName();
        this.param(`filter[${groupName}][condition][path]`, path);
        this.param(`filter[${groupName}][condition][operator]`, operator);
        this.param(`filter[${groupName}][condition][value]`, value);
        this.assignFilterGroupToCurrentFilterGroup(groupName);
        return this;
    }

    /**
     * @param groupName
     * @private
     */
    private assignFilterGroupToCurrentFilterGroup(groupName) {
        if (this.currentFilterGroupName) {
            this.param(`filter[${groupName}][condition][memberOf]`, this.currentFilterGroupName);
        }
    }

    /**
     * Registers includes (as described by JSON:API)
     * @param includes
     */
    public include(includes: string[]): this {
        this.param('include', includes.join(','));
        return this;
    }

    /**
     * @param amount
     */
    public limit(amount: number): this {
        this.param('page[limit]', amount);
        return this;
    }

    /**
     * @param path
     * @param direction
     */
    public sort(path: string, direction: 'asc' | 'desc' = 'asc'): this {
        const groupName = this.createFilterGroupName();
        this.param(`sort[${groupName}][path]`, path);
        this.param(`sort[${groupName}][direction]`, direction);

        return this;
    }

    /**
     * @param operator
     * @param groupingCall
     */
    public group(operator: 'or' | 'and', groupingCall: (query: QueryBuilder<T>) => void): this {
        const currentFilterGroupName = this.currentFilterGroupName;
        const newGroupName = this.createFilterGroupName();
        this.assignFilterGroupToCurrentFilterGroup(newGroupName);
        this.currentFilterGroupName = newGroupName;
        this.param(`filter[${this.currentFilterGroupName}][group][conjunction]`, operator.toUpperCase());
        groupingCall(this);
        this.currentFilterGroupName = currentFilterGroupName;
        return this;
    }

    /**
     * @param page
     * @param perPage
     */
    paginate(page: number, perPage: number): this {
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
    async get(): Promise<T[]> {
        this.rawResponse = await this.performGetRequest(this.endpoint);

        if (typeof this.rawResponse.data === 'undefined') {
            console.error(this.buildUrl(this.endpoint), this.rawResponse.errors[0].detail);
            return [];
        }

        const responseModels = this.rawResponse.data.map((entry: any) => new ResponseModel(entry));

        if (!this.mapper) {
            return responseModels;
        }

        let result: T[] = [];
        for await (const item of responseModels) {
            const mapped = await this.mapper(item);
            result.push(mapped);
        }

        return result;
    }

    /**
     *
     */
    async getFirst(): Promise<T> {
        const all = await this.get();
        return all[0];
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
