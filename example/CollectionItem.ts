import type { DataProperties, ResponseModelInterface } from '../src/index';
import { Model } from '../src/index';

export default class CollectionItem extends Model {
    public id!: string;
    public title!: string;
    public text!: string;
    public url!: string;

    protected static endpoint: string = 'api/collection-item';

    // Tell the model how to map from the response data
    async map(response: ResponseModelInterface): Promise<DataProperties<CollectionItem>> {
        return {
            text: response.get<string>('hero_message.processed', ''),
            id: response.get<string>('id', ''),
            url: response.get<string>('path.localized_alias', (`/${response.get<string>('langcode', '')}${response.get<string>('path.alias', '')}`)),
            title: response.get<string>('title', ''),
        };
    }
}
