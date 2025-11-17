import Container from "../Container";
import { TMapper } from "../types/mapper";
import ResponseModel from "../ResponseModel";

const defaultMapper = (response: ResponseModel) => {
    return response;
};

export default function query(endpoint: string, mapper: TMapper<any> = defaultMapper) {
    return Container.make('QueryBuilderInterface', endpoint, mapper);
}