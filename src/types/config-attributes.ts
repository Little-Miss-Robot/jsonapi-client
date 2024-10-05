import {TNullable} from "./nullable";

export type TConfigAttributes = TNullable<{
	baseUrl?: string,
	clientId?: string,
	clientSecret?: string,
	username?: string,
	password?: string,
}>;