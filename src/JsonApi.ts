import type { TConfigAttributes } from './types/config-attributes';
import { TMapper } from "./types/mapper";
import Client from "./Client";
import QueryBuilder from "./QueryBuilder";
import OAuth from "./auth/OAuth";
import EventBus from "./EventBus";
import Config from "./Config";
import {container} from "./facades/container";
import config from "./facades/config";
import client from "./facades/client";
import {events} from "./facades/events";
import macros from "./facades/macros";
import MacroRegistry from "./MacroRegistry";

export default class JsonApi {

	public static init(configAttributes: TConfigAttributes) {

		container().singleton('MacroRegistryInterface', () => {
			return new MacroRegistry();
		});

		container().singleton('Config', () => {
			return new Config(configAttributes);
		});

		container().singleton('EventBusInterface', () => {
			return new EventBus();
		});

		container().bind('QueryBuilderInterface', (endpoint: string, mapper: TMapper<any>) => {
			return new QueryBuilder(
				client(),
				events(),
				macros(),
				endpoint,
				mapper,
			);
		});

		container().singleton('AuthInterface', () => {
			return new OAuth(
				config().get('baseUrl'),
				config().get('clientId'),
				config().get('clientSecret'),
				events()
			);
		});

		container().singleton('ClientInterface', () => {
			return new Client(
				container().make('AuthInterface'),
				config().get('baseUrl')
			);
		});
	}
}
