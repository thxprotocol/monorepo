import axios from 'axios';
import jwt from 'jsonwebtoken';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { API_URL, GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET } from '../config/secrets';
import { Token, TokenDocument } from '../models/Token';
import { IOAuthService } from './interfaces/IOAuthService';
import { logger } from '../util/logger';
import { AccessTokenKind, OAuthGoogleScope } from '@thxnetwork/common/enums';

const GOOGLE_OAUTH_REDIRECT_URL = API_URL + '/v1/oauth/callback/google';

export default class YouTubeService implements IOAuthService {
    private client: OAuth2Client;

    constructor() {
        this.client = new google.auth.OAuth2(
            GOOGLE_OAUTH_CLIENT_ID,
            GOOGLE_OAUTH_CLIENT_SECRET,
            GOOGLE_OAUTH_REDIRECT_URL,
        );
        google.options({ auth: this.client });
    }

    getLoginURL({ uid, scopes }: { uid: string; scopes: OAuthGoogleScope[] }) {
        const state = Buffer.from(JSON.stringify({ uid })).toString('base64');
        return this.client.generateAuthUrl({
            state,
            access_type: 'offline',
            scope: scopes.map((scope) => `${decodeURIComponent(scope)}`).join(' '),
        });
    }

    async requestToken(code: string) {
        const { tokens } = await this.client.getToken(code);
        const expiry = tokens.expiry_date ? Date.now() + Number(tokens.expiry_date) : undefined;
        const claims = await jwt.decode(tokens.id_token);

        return {
            kind: AccessTokenKind.Google,
            expiry,
            scopes: tokens.scope.split(' ') as OAuthGoogleScope[],
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            userId: claims.sub,
        };
    }

    async refreshToken(token: TokenDocument): Promise<TokenDocument> {
        const refreshToken = await this.getRefreshToken(token);

        this.client.setCredentials({
            refresh_token: refreshToken,
            access_token: token.accessToken,
        });

        const googleToken = await this.client.getAccessToken();
        const { expiry_date, sub, scopes } = await this.client.getTokenInfo(googleToken.token);

        return await Token.findByIdAndUpdate(
            token._id,
            {
                accessToken: googleToken,
                refreshToken,
                expiry: expiry_date,
                scope: scopes.join(' '),
                userId: sub,
            },
            { new: true },
        );
    }

    async revokeToken(token: TToken): Promise<void> {
        try {
            const url = new URL('https://oauth2.googleapis.com/revoke');
            if (token.accessToken) {
                await axios({ url: url.toString(), method: 'POST', params: { token: token.accessToken } });
            }
            if (token.refreshToken) {
                await axios({ url: url.toString(), method: 'POST', params: { token: token.refreshToken } });
            }
        } catch (error) {
            logger.error(error);
        }
    }

    // We only get one refreshToken from google and should use it for
    // all token variations we store
    private async getRefreshToken({ sub }: TokenDocument) {
        const [token] = await Token.find({
            scope: { $in: ['google', 'youtube-view', 'youtube-manage'] },
            refreshToken: { $exists: true, $ne: '' },
            sub,
        });
        return token && token.refreshToken;
    }
}
