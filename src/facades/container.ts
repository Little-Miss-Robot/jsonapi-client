import {ClientInterface} from "../contracts/ClientInterface";
import {Container} from "../Container";
import {AuthInterface} from "../contracts/AuthInterface";
import {EventBusInterface} from "../contracts/EventBusInterface";
import {TEventMap} from "../types/event-bus";
import {QueryBuilderInterface} from "../contracts/QueryBuilderInterface";
import {TMapper} from "../types/mapper";
import Config from "../Config";

type AppBindings = {
    Config: () => Config;
    ClientInterface: () => ClientInterface;
    AuthInterface: () => AuthInterface;
    EventBusInterface: () => EventBusInterface<TEventMap>;
    QueryBuilderInterface: (endpoint: string, mapper: TMapper<any>) => QueryBuilderInterface<any>;
};

let singletonContainer = null;

export function container(): Container<AppBindings> {

    if (! singletonContainer) {
        singletonContainer = new Container<AppBindings>();
    }

    return singletonContainer;
}