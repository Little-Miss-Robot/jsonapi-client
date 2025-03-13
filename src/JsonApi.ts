import type { TConfigAttributes } from './types/config-attributes';
import Container from "./Container";
import Client from "./Client";
import Config from "./Config";

export default class JsonApi {

	public static init(config: TConfigAttributes) {

		Config.setAll(config);

		Container.singleton('ClientInterface', () => {
			return new Client(
				Config.get('baseUrl'),
				Config.get('clientId'),
				Config.get('clientSecret')
			);
		});
	}
}
