import type { TConfigAttributes } from './types/config-attributes';
import { TMapper } from "./types/mapper";
import Container from "./Container";
import Client from "./Client";
import Config from "./Config";
import QueryBuilder from "./QueryBuilder";
import OAuth from "./auth/OAuth";
import EventBus from "./EventBus";
import MacroRegistry from "./MacroRegistry";

export default class JsonApi {

	public static init(config: TConfigAttributes) {

		Config.setAll(config);

		Container.singleton('MacroRegistryInterface', () => {
			return new MacroRegistry();
		});

		Container.singleton('EventBusInterface', () => {
			return new EventBus();
		});

		Container.bind('QueryBuilderInterface', (endpoint: string, mapper: TMapper<any>) => {
			return new QueryBuilder(
				Container.make('ClientInterface'),
				Container.make('EventBusInterface'),
				Container.make('MacroRegistryInterface'),
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
			return new Client(
				Container.make('AuthInterface'),
				Config.get('baseUrl')
			);
		});
	}
}
