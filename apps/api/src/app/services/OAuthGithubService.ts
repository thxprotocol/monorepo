import { API_URL, GITHUB_OAUTH_CLIENT_ID, GITHUB_OAUTH_CLIENT_SECRET } from '@thxnetwork/api/config/secrets';
import { IOAuthService } from './interfaces/IOAuthService';
import { TokenDocument } from '../models/Token';
import axios, { AxiosInstance } from 'axios';
import { AccessTokenKind, OAuthGithubScope } from '@thxnetwork/common/enums';

const GITHUB_API_ENDPOINT = 'https://api.github.com';
const GITHUB_OAUTH_REDIRECT_URL = API_URL + '/v1/oauth/callback/github';

export default class GithubService implements IOAuthService {
    client: AxiosInstance;

    constructor() {
        this.client = axios.create({ baseURL: GITHUB_API_ENDPOINT });
    }

    getLoginURL({ uid, scopes }: { uid: string; scopes: OAuthGithubScope[] }) {
        const state = Buffer.from(JSON.stringify({ uid })).toString('base64');
        const url = new URL('https://github.com/login/oauth/authorize');
        url.searchParams.append('state', state);
        url.searchParams.append('allow_signup', 'true');
        url.searchParams.append('client_id', GITHUB_OAUTH_CLIENT_ID);
        url.searchParams.append('redirect_uri', GITHUB_OAUTH_REDIRECT_URL);
        url.searchParams.append('scope', scopes.join(' '));

        return url.toString();
    }

    async requestToken(code: string) {
        const { data } = await this.client({
            url: 'https://github.com/login/oauth/access_token',
            method: 'POST',
            data: {
                code,
                redirect_uri: GITHUB_OAUTH_REDIRECT_URL,
                client_secret: GITHUB_OAUTH_CLIENT_SECRET,
                client_id: GITHUB_OAUTH_CLIENT_ID,
            },
        });

        const search = new URLSearchParams(data);
        const accessToken = search.get('access_token');
        const refreshToken = search.get('refresh_token');
        const expiresIn = search.get('expires_in');
        const expiry = expiresIn && Date.now() + Number(expiresIn) * 1000;
        const user = await this.getUser(accessToken);

        return {
            kind: AccessTokenKind.Github,
            accessToken,
            refreshToken,
            expiry,
            userId: user.id,
        };
    }

    async refreshToken(token: TokenDocument) {
        const { data } = await this.client({
            url: 'https://github.com/login/oauth/access_token',
            method: 'POST',
            data: {
                refresh_token: token.refreshToken,
                grant_type: 'authorization_code',
                client_secret: GITHUB_OAUTH_CLIENT_SECRET,
                client_id: GITHUB_OAUTH_CLIENT_ID,
            },
        });
        return data;
    }

    revokeToken(token: TAccessToken): Promise<void> {
        throw new Error('Method not implemented.');
    }

    private async getUser(accessToken: string) {
        const { data } = await this.client({
            url: '/user',
            method: 'GET',
            headers: {
                Authorization: 'Bearer ' + accessToken,
            },
        });
        return data;
    }
}
