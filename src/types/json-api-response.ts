export type TJsonApiResponse = {
	json_api: Object;
	data: Array<Object>;
	meta?: Record<string, any>;
};