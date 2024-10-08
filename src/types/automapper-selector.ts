import {ResponseModelInterface} from "../contracts/ResponseModelInterface";

export type TAutoMapperSelector = (responseModel: ResponseModelInterface, selectValue: string) => boolean;
