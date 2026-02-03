import type { TConfigAttributes } from './types/config-attributes';
import Client from "./Client";
import QueryBuilder from "./QueryBuilder";
import { TMapper } from "./types/mapper";
import OAuth from "./auth/OAuth";
import EventBus from "./EventBus";
import Config from "./Config";
import {container} from "./facades/container";
import config from "./facades/config";
import client from "./facades/client";

export default class JsonApi {

	public static init(configAttributes: TConfigAttributes) {

		container().singleton('Config', () => {
			return new Config(configAttributes);
		});

		container().singleton('EventBusInterface', () => {
			return new EventBus();
		});

		container().bind('QueryBuilderInterface', (endpoint: string, mapper: TMapper<any>) => {
			return new QueryBuilder(
				client(),
				container().make('EventBusInterface'),
				endpoint,
				mapper,
			);
		});

		container().singleton('AuthInterface', () => {
			return new OAuth(
				config().get('baseUrl'),
				config().get('clientId'),
				config().get('clientSecret')
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
