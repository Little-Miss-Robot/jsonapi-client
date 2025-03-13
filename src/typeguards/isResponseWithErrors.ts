import { TResponseWithErrors } from "../types/response-with-errors";

export function isResponseWithErrors(value: unknown): value is TResponseWithErrors {
	return typeof value === "object" && "errors" in value && Array.isArray(value.errors) && value.errors.length > 0;
}
