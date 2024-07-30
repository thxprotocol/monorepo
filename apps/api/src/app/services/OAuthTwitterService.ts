import { URLSearchParams } from 'url';
import { API_URL, TWITTER_OAUTH_CLIENT_ID, TWITTER_OAUTH_CLIENT_SECRET } from '@thxnetwork/api/config/secrets';
import { IOAuthService } from '@thxnetwork/api/services/interfaces/IOAuthService';
import { Token, TokenDocument } from '@thxnetwork/api/models/Token';
import { logger } from '@thxnetwork/api/util/logger';
import { AccessTokenKind, OAuthTwitterScope } from '@thxnetwork/common/enums';
import axios, { AxiosInstance } from 'axios';

const TWITTER_API_ENDPOINT = 'https://api.twitter.com/2';
const TWITTER_OAUTH_REDIRECT_URL = API_URL + '/v1/oauth/callback/twitter';

export default class TwitterService implements IOAuthService {
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create({ baseURL: TWITTER_API_ENDPOINT });
    }

    getLoginURL({ uid, scopes }: { uid: string; scopes: OAuthTwitterScope[] }): string {
        const state = Buffer.from(JSON.stringify({ uid })).toString('base64');
        const authorizeURL = new URL('https://twitter.com/i/oauth2/authorize');

        authorizeURL.searchParams.append('response_type', 'code');
        authorizeURL.searchParams.append('client_id', TWITTER_OAUTH_CLIENT_ID);
        authorizeURL.searchParams.append('redirect_uri', TWITTER_OAUTH_REDIRECT_URL);
        authorizeURL.searchParams.append('scope', scopes.join(' '));
        authorizeURL.searchParams.append('state', state);
        authorizeURL.searchParams.append('code_challenge', 'challenge');
        authorizeURL.searchParams.append('code_challenge_method', 'plain');

        return authorizeURL.toString();
    }

    async requestToken(code: string): Promise<Partial<TToken>> {
        const authHeader =
            'Basic ' + Buffer.from(`${TWITTER_OAUTH_CLIENT_ID}:${TWITTER_OAUTH_CLIENT_SECRET}`).toString('base64');
        const body = new URLSearchParams();
        body.append('code', code);
        body.append('grant_type', 'authorization_code');
        body.append('client_id', TWITTER_OAUTH_CLIENT_ID);
        body.append('redirect_uri', TWITTER_OAUTH_REDIRECT_URL);
        body.append('code_verifier', 'challenge');

        const { data } = await this.client({
            url: '/oauth2/token',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': authHeader,
            },
            data: body,
        });
        const expiry = data.expires_in ? Date.now() + Number(data.expires_in) * 1000 : undefined;
        const user = await this.getUser(data.access_token);

        return {
            kind: AccessTokenKind.Twitter,
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            expiry,
            scopes: data.scope.split(' '),
            userId: user.id,
            metadata: {
                name: user.name,
                username: user.username,
            },
        };
    }

    async refreshToken(token: TokenDocument) {
        const authHeader =
            'Basic ' + Buffer.from(`${TWITTER_OAUTH_CLIENT_ID}:${TWITTER_OAUTH_CLIENT_SECRET}`).toString('base64');
        const body = new URLSearchParams();
        body.append('refresh_token', token.refreshToken);
        body.append('grant_type', 'refresh_token');
        body.append('client_id', TWITTER_OAUTH_CLIENT_ID);

        const { data } = await this.client({
            url: '/oauth2/token',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': authHeader,
            },
            data: body,
        });

        return await Token.findByIdAndUpdate(
            token._id,
            {
                accessToken: data.access_token,
                refreshToken: data.refresh_token,
                expiry: Date.now() + Number(data.expires_in) * 1000,
            },
            { new: true },
        );
    }

    async revokeToken(token: TToken): Promise<void> {
        const body = new URLSearchParams();
        body.append('token', token.accessToken);
        body.append('token_type_hint', 'access_token');
        body.append('client_id', TWITTER_OAUTH_CLIENT_ID);
        try {
            await this.client({
                url: '/oauth2/revoke',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                data: body,
            });
        } catch (error) {
            // Revocation request is failing with a 401, insufficient docs make it hard to
            // gues what the exact payload should be, so for now we fail silently so the
            // token can be removed from storage.
            logger.error(error);
        }
    }

    private async getUser(accessToken: string) {
        const { data } = await this.client({
            url: '/users/me',
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        return data.data;
    }
}
