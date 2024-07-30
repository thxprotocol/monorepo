import { AccessTokenKind } from '@thxnetwork/common/enums';
import { SECURE_KEY } from '@thxnetwork/api/config/secrets';
import { Token, TokenDocument } from '@thxnetwork/api/models/Token';
import { decryptString } from '@thxnetwork/api/util/decrypt';
import { logger } from '@thxnetwork/api/util/logger';
import { serviceMap } from '@thxnetwork/api/services/interfaces/IOAuthService';

class TokenService {
    async get({ sub, kind }: Partial<TToken>): Promise<TToken> {
        const token = await Token.findOne({ sub, kind });
        if (!token) return;

        const { accessTokenEncrypted, refreshTokenEncrypted } = token;
        const accessToken = accessTokenEncrypted && decryptString(accessTokenEncrypted, SECURE_KEY);
        const refreshToken = refreshTokenEncrypted && decryptString(refreshTokenEncrypted, SECURE_KEY);
        const refreshedToken = await this.refresh(token);

        return { ...refreshedToken.toJSON(), accessToken, refreshToken };
    }

    // Store the token for the new account
    async set(token: Partial<TToken>) {
        return await Token.findOneAndUpdate({ sub: token.sub, kind: token.kind }, token, { upsert: true, new: true });
    }

    async unset({ sub, kind }: Partial<TToken>) {
        const token = await this.get({ sub, kind });

        // Revoke access at token provider if token has scopes
        if (token && token.scopes.length) {
            await this.revoke(token);
        }

        // Remove from storage
        return this.remove({ sub, kind });
    }

    private async refresh(token: TokenDocument) {
        // Return token if there is no expiry or no refreshtoken
        if (!token || !token.expiry || !token.refreshToken) return token;

        // Check if token is expired
        const isExpired = Date.now() > token.expiry;
        if (!isExpired) return token;

        try {
            // If so, refresh the token and return
            return await serviceMap[token.kind].refreshToken(token);
        } catch (error) {
            logger.error('Token refresh failed', { error });
            return token;
        }
    }

    private remove({ sub, kind }: { sub: string; kind: AccessTokenKind }) {
        return Token.findOneAndDelete({ sub, kind });
    }

    revoke(token: TToken) {
        return serviceMap[token.kind].revokeToken(token);
    }
}
export default new TokenService();
