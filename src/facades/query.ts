import { TMapper } from "../types/mapper";
import ResponseModel from "../ResponseModel";
import {container} from "./container";

const defaultMapper = (response: ResponseModel) => {
    return response;
};

export default function query(endpoint: string, mapper: TMapper<any> = defaultMapper) {
    return container().make('QueryBuilderInterface', endpoint, mapper);
}