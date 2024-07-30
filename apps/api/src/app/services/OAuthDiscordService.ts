import { API_URL, DISCORD_OAUTH_CLIENT_ID, DISCORD_OAUTH_CLIENT_SECRET } from '@thxnetwork/api/config/secrets';
import { Token, TokenDocument } from '../models/Token';
import { IOAuthService } from './interfaces/IOAuthService';
import { AccessTokenKind, OAuthDiscordScope } from '@thxnetwork/common/enums';
import axios, { AxiosInstance } from 'axios';

const DISCORD_API_ENDPOINT = 'https://discord.com/api/v10';
const DISCORD_OAUTH_REDIRECT_URL = API_URL + '/v1/oauth/callback/discord';

export default class DiscordService implements IOAuthService {
    client: AxiosInstance;

    constructor() {
        this.client = axios.create({ baseURL: DISCORD_API_ENDPOINT });
    }

    getLoginURL({ uid, scopes }: { uid: string; scopes: OAuthDiscordScope[] }): string {
        const state = Buffer.from(JSON.stringify({ uid })).toString('base64');
        const url = new URL('https://discord.com/oauth2/authorize');
        url.searchParams.append('state', state);
        url.searchParams.append('response_type', 'code');
        url.searchParams.append('client_id', DISCORD_OAUTH_CLIENT_ID);
        url.searchParams.append('redirect_uri', DISCORD_OAUTH_REDIRECT_URL);
        url.searchParams.append('scope', scopes.join(' '));

        return url.toString();
    }

    async requestToken(code: string) {
        const body = new URLSearchParams();
        body.append('code', code);
        body.append('grant_type', 'authorization_code');
        body.append('redirect_uri', DISCORD_OAUTH_REDIRECT_URL);
        body.append('client_secret', DISCORD_OAUTH_CLIENT_SECRET);
        body.append('client_id', DISCORD_OAUTH_CLIENT_ID);

        const { data } = await this.client({
            url: 'https://discord.com/api/oauth2/token',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            data: body,
        });
        const user = await this.getUser(data.access_token);

        return {
            kind: AccessTokenKind.Discord,
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            expiry: Date.now() + Number(data.expires_in) * 1000,
            scopes: data.scope.split(' '),
            userId: user.id,
        };
    }

    async refreshToken(token: TokenDocument) {
        const body = new URLSearchParams();
        body.append('grant_type', 'refresh_token');
        body.append('refresh_token', token.refreshToken);
        body.append('client_secret', DISCORD_OAUTH_CLIENT_SECRET);
        body.append('client_id', DISCORD_OAUTH_CLIENT_ID);

        const { data } = await this.client({
            url: 'https://discord.com/api/oauth2/token',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            data: body,
        });

        return await Token.findByIdAndUpdate(
            token._id,
            {
                accessToken: data.access_token,
                refreshToken: data.refresh_token,
                expiry: data.expires_in && Date.now() + Number(data.expires_in) * 1000,
            },
            { new: true },
        );
    }

    async revokeToken(token: TToken): Promise<void> {
        const body = new URLSearchParams();
        body.append('client_secret', DISCORD_OAUTH_CLIENT_SECRET);
        body.append('client_id', DISCORD_OAUTH_CLIENT_ID);
        body.append('token', token.accessToken);

        await this.client({
            url: 'https://discord.com/api/oauth2/token/revoke',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            data: body,
        });
    }

    private async getUser(accessToken: string) {
        const { data } = await this.client({
            url: '/oauth2/@me',
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
        });
        return data.user;
    }
}
