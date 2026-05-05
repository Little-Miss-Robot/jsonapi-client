import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import type { TokenPayload, TokenStorageInterface } from '../contracts/TokenStorageInterface';
import type { TNullable } from '../types/index';
import { dirname } from 'node:path';
import { isTokenPayload } from '../typeguards/isTokenPayload';

export default class FilesystemTokenStorage implements TokenStorageInterface {
    /**
     * @private
     */
    private readonly filePath: string;

    /**
     * @param filePath Absolute or relative path to the token JSON file.
     */
    constructor(filePath: string) {
        this.filePath = filePath;
    }

    store(tokenPayload: TokenPayload): void {
        mkdirSync(dirname(this.filePath), { recursive: true });

        writeFileSync(
            this.filePath,
            JSON.stringify(tokenPayload, null, 2),
            { encoding: 'utf8', mode: 0o600 },
        );
    }

    retrieve(): TNullable<TokenPayload> {
        if (!existsSync(this.filePath)) {
            return null;
        }

        try {
            const payload = JSON.parse(readFileSync(this.filePath, 'utf8'));

            if (!isTokenPayload(payload)) {
                return null;
            }

            return {
                token: payload.token,
                expiresAt: payload.expiresAt,
            };
        }
        catch {
            return null;
        }
    }
}
