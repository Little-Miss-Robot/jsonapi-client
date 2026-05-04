import type { ConfigAttributes } from './types/config-attributes';
import type { TMapper } from './types/mapper';
import InMemoryTokenStorage from './auth/InMemoryTokenStorage';
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
import DefaultFetchPolicy from './policies/DefaultFetchPolicy';
import QueryBuilder from './QueryBuilder';

export default class JsonApi {
    /**
     * Initializes the JSONAPI-client with default dependencies
     * @param configAttributes
     */
    public static init(configAttributes: ConfigAttributes) {
        const c = container();

        c.singleton('macros', () => {
            return new MacroRegistry();
        });

        c.singleton('config', () => {
            return new Config<ConfigAttributes>({
                ...{
                    tokenExpirySafetyWindow: 60000,
                    maxRetries: 2,
                    retryDelay: 1000,
                    itemsCountPath: 'count',
                },
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

        c.singleton('tokenStorage', () => {
            return new InMemoryTokenStorage();
        });

        c.singleton('auth', () => {
            return new OAuth(
                config().get('baseUrl'),
                config().get('clientId'),
                config().get('clientSecret'),
                c.make('tokenStorage'),
                events(),
            );
        });

        c.singleton('fetchPolicy', () => {
            return new DefaultFetchPolicy();
        });

        c.singleton('client', () => {
            return new Client(
                c.make('auth'),
                c.make('fetchPolicy'),
                events(),
                config().get('baseUrl'),
            );
        });
    }
}
