import type { TNullable } from '../types/index';

export interface TokenPayload {
    token: string
    expiresAt: number
}

export interface TokenStorageInterface {
    /**
     * Stores a token payload
     */
    store: (tokenPayload: TokenPayload) => void | Promise<void>

    /**
     * Retrieves a token payload
     */
    retrieve: () => TNullable<TokenPayload> | Promise<TNullable<TokenPayload>>
}
