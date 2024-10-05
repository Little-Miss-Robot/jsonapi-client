export interface QueryBuilderInterface {
	get(): Promise<Array<any>>;
	getRaw(): Promise<any>;
	getById(id: string): Promise<any>;
}