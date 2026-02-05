import type Config from '../Config';
import type { AuthInterface } from '../contracts/AuthInterface';
import type { ClientInterface } from '../contracts/ClientInterface';
import type { EventBusInterface } from '../contracts/EventBusInterface';
import type { MacroRegistryInterface } from '../contracts/MacroRegistryInterface';
import type { QueryBuilderInterface } from '../contracts/QueryBuilderInterface';
import type { ConfigAttributes } from '../types/config-attributes';
import type { ContainerFactoryMap } from '../types/container-factory-map';
import type { TEventMap } from '../types/event-bus';
import type { TMapper } from '../types/mapper';
import { Container } from '../Container';

interface AppBindings extends ContainerFactoryMap {
    config: () => Config<ConfigAttributes>
    client: () => ClientInterface
    auth: () => AuthInterface
    events: () => EventBusInterface<TEventMap>
    query: (endpoint: string, mapper: TMapper<any>) => QueryBuilderInterface<any>
    macros: () => MacroRegistryInterface
}

let singletonContainer = null;

export function container(): Container<AppBindings> {
    if (!singletonContainer) {
        singletonContainer = new Container<AppBindings>();
    }

    return singletonContainer;
}
