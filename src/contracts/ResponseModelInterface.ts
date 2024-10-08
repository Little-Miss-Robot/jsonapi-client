import {TMapper} from "../types/mapper";

export interface ResponseModelInterface {
	get(path: string | string[], defaultValue?: any): any;
	map(path: string | string[], mapper?: TMapper<any>);
}
