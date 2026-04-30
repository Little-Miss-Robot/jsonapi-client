import type { TNullable } from '../types/index';

export interface TokenPayload {
    token: string
    expiresAt: number
}

export interface TokenStorageInterface {
    /**
     * Stores a token
     */
    store: (tokenPayload: TokenPayload) => void | Promise<void>

    /**
     * @param token
     * @param tokenExpiryDate
     */
    retrieve: () => TNullable<TokenPayload> | Promise<TNullable<TokenPayload>>
}
