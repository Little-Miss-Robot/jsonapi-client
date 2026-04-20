import type { DataProperties, ResponseModelInterface } from '../src/index';
import { Model } from '../src/index';

export default class Event extends Model {
    public id!: string;
    public title!: string;

    /**
     * @protected
     */
    protected static endpoint: string = 'api/event';

    /**
     * @protected
     */
    protected static include = [];

    /**
     * Override the default gate to only include events that have a title
     * @param responseModel
     */
    public static gate(responseModel: ResponseModelInterface): boolean {
        return responseModel.get('attributes.title', false);
    }

    /**
     * Tell the model how to map from the response data
     * @param response
     */
    async map(response: ResponseModelInterface): Promise<DataProperties<Event>> {
        return {
            id: response.get('id', ''),
            title: response.get('attributes.title', ''),
        };
    }
}
