import type { TokenPayload, TokenStorageInterface } from '../contracts/TokenStorageInterface';
import type { TNullable } from '../types/index';

export default class InMemoryTokenStorage implements TokenStorageInterface {
    /**
     * @private
     */
    private token: TNullable<string> = null;

    /**
     * @private
     */
    private expiresAt: TNullable<number> = null;

    /**
     * @param tokenPayload
     */
    store(tokenPayload: TokenPayload): void | Promise<void> {
        this.token = tokenPayload.token;
        this.expiresAt = tokenPayload.expiresAt;
    }

    /**
     *
     */
    retrieve(): TNullable<TokenPayload> {
        if (this.token !== null && this.expiresAt !== null) {
            return {
                token: this.token,
                expiresAt: this.expiresAt,
            };
        }

        return null;
    }
}
