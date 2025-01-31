import {TJsonApiResponse} from "../types/json-api-response";

export function isJsonApiResponse(value: unknown): value is TJsonApiResponse {
	return (
		typeof value === "object" &&
		value !== null &&
		"jsonapi" in value &&
		"data" in value &&
		typeof value.data === "object" &&
		typeof value.jsonapi === "object" &&
		"version" in value.jsonapi &&
		value.jsonapi.version === '1.0'
	);
}