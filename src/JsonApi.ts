import type { TConfigAttributes } from './types/config-attributes';
import Container from "./Container";
import Client from "./Client";
import Config from "./Config";
import QueryBuilder from "./QueryBuilder";
import {TMapper} from "./types/mapper";
import OAuth from "./auth/OAuth";

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

		Container.singleton('AuthInterface', () => {
			return new OAuth(
				Config.get('baseUrl'),
				Config.get('clientId'),
				Config.get('clientSecret')
			);
		});

		Container.singleton('ClientInterface', () => {
			return new Client(Container.make('AuthInterface'), Config.get('baseUrl'));
		});
	}
}
