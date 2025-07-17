import type { TConfigAttributes } from './types/config-attributes';
import Container from "./Container";
import Client from "./Client";
import Config from "./Config";
import QueryBuilder from "./QueryBuilder";
import {TMapper} from "./types/mapper";

export default class JsonApi {

	public static init(config: TConfigAttributes) {

		Config.setAll(config);

		Container.bind('QueryBuilderInterface', (endpoint: string, mapper: TMapper<any>) => {
			return new QueryBuilder(
				Container.make('ClientInterface'),
				endpoint,
				mapper,
			);
		});
		
		Container.singleton('ClientInterface', () => {
			return new Client(
				Config.get('baseUrl'),
				Config.get('clientId'),
				Config.get('clientSecret')
			);
		});
	}
}
