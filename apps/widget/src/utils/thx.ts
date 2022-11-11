import { THXClient } from '@thxnetwork/sdk';
import { CLIENT_ID, CLIENT_SECRET, AUTH_URL } from '../config/secrets';

export const thx = new THXClient({
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    redirectUrl: AUTH_URL + '/signin-oidc',
    scopes: 'openid account:read erc20:read erc721:read',
});
