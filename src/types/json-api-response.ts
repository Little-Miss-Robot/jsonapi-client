export interface TJsonApiResponse {
    json_api: object
    data: Array<object>
    meta?: Record<string, any>
}
