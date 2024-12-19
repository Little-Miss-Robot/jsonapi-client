import type { TNullable } from './nullable';

export type TConfigAttributes = {
    baseUrl: TNullable<string>
    clientId: TNullable<string>
    clientSecret: TNullable<string>
    username: TNullable<string>
    password: TNullable<string>
};
