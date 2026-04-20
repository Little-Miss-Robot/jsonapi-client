import type { DataProperties, ResponseModelInterface } from '../src/index';
import { Model } from '../src/index';

export default class ResearchRecord extends Model {
    public id!: string;
    public title!: string;

    /**
     * @protected
     */
    protected static endpoint: string = 'api/index/research_records';

    /**
     * Tell the model how to map from the response data
     * @param response
     */
    async map(response: ResponseModelInterface): Promise<DataProperties<ResearchRecord>> {
        return {
            id: response.get('id', ''),
            title: response.get('attributes.title', ''),
        };
    }
}
