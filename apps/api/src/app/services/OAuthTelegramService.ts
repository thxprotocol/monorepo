import { API_URL, TELEGRAM_BOT_TOKEN } from '@thxnetwork/api/config/secrets';
import { TokenDocument } from '../models/Token';
import { IOAuthService } from './interfaces/IOAuthService';
import { AccessTokenKind, OAuthTelegramScope } from '@thxnetwork/common/enums';
import axios, { AxiosInstance } from 'axios';
import crypto from 'crypto';

const TELEGRAM_API_ENDPOINT = 'https://api.telegram.org';
const TELEGRAM_OAUTH_REDIRECT_URL = API_URL + '/v1/oauth/callback/telegram';

export default class TelegramService implements IOAuthService {
    client: AxiosInstance;

    constructor() {
        this.client = axios.create({ baseURL: TELEGRAM_API_ENDPOINT });
    }

    getLoginURL({ uid, scopes }: { uid: string; scopes: OAuthTelegramScope[] }): string {
        const state = Buffer.from(JSON.stringify({ uid })).toString('base64');
        const url = new URL('https://oauth.telegram.org/auth');
        url.searchParams.append('bot_id', TELEGRAM_BOT_TOKEN.split(':')[0]);
        url.searchParams.append('origin', API_URL);
        url.searchParams.append('return_to', TELEGRAM_OAUTH_REDIRECT_URL);
        url.searchParams.append('state', state);
        url.searchParams.append('request_access', 'write');

        return url.toString();
    }

    async requestToken(authData: any) {
        // Verify the hash
        const dataCheckString = Object.keys(authData)
            .filter((key) => key !== 'hash')
            .sort()
            .map((key) => `${key}=${authData[key]}`)
            .join('\n');

        const secretKey = crypto.createHash('sha256').update(TELEGRAM_BOT_TOKEN).digest();

        const hash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

        if (hash !== authData.hash) {
            throw new Error('Invalid hash');
        }

        // Check if auth_date is not too old (e.g., within last 24 hours)
        const authDate = parseInt(authData.auth_date);
        if (Date.now() / 1000 - authDate > 86400) {
            throw new Error('Auth data is too old');
        }

        return {
            kind: AccessTokenKind.Telegram,
            accessToken: authData.hash,
            refreshToken: null,
            expiry: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
            scopes: ['user'],
            userId: authData.id.toString(),
            userData: {
                firstName: authData.first_name,
                lastName: authData.last_name,
                username: authData.username,
                photoUrl: authData.photo_url,
            },
        };
    }

    async refreshToken(token: TokenDocument) {
        // Telegram doesn't support refresh tokens
        return token;
    }

    async revokeToken(token: TAccessToken): Promise<void> {
        // Telegram doesn't support token revocation
        return;
    }

    private async getUser(accessToken: string) {
        // Since we already have user data from the auth response,
        // we don't need to make an additional API call
        return null;
    }
}
