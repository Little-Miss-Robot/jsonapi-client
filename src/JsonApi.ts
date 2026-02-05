import type { ConfigAttributes } from './types/config-attributes';
import type { TMapper } from './types/mapper';
import OAuth from './auth/OAuth';
import Client from './Client';
import Config from './Config';
import EventBus from './EventBus';
import client from './facades/client';
import config from './facades/config';
import { container } from './facades/container';
import { events } from './facades/events';
import macros from './facades/macros';
import MacroRegistry from './MacroRegistry';
import QueryBuilder from './QueryBuilder';

export default class JsonApi {
    public static init(configAttributes: ConfigAttributes) {
        const c = container();

        c.singleton('macros', () => {
            return new MacroRegistry();
        });

        c.singleton('config', () => {
            return new Config({
                ...{ tokenExpirySafetyWindow: 60000 },
                ...configAttributes,
            });
        });

        c.singleton('events', () => {
            return new EventBus();
        });

        c.bind('query', (endpoint: string, mapper: TMapper<any>) => {
            return new QueryBuilder(
                client(),
                events(),
                macros(),
                endpoint,
                mapper,
            );
        });

        c.singleton('auth', () => {
            return new OAuth(
                config().get('baseUrl'),
                config().get('clientId'),
                config().get('clientSecret'),
                events(),
            );
        });

        c.singleton('client', () => {
            return new Client(
                c.make('auth'),
                config().get('baseUrl'),
            );
        });
    }
}
