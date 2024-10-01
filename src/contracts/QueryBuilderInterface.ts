export interface QueryBuilderInterface {
	getAll(): Promise<Array<any>>;
	getRaw(): Promise<any>;
	getById(id: string): Promise<any>;
}