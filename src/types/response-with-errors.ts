export interface TResponseWithErrors {
    errors: Array<{
        title: string
        status: string
        detail: string
        links: object
    }>
}
