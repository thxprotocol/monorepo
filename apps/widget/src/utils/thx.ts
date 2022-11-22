import { THXClient } from '@thxnetwork/sdk';
import { WIDGET_URL, CLIENT_ID, CLIENT_SECRET } from '../config/secrets';

export const thx = new THXClient({
    env: 'local',
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    redirectUrl: WIDGET_URL,
    scopes: 'openid account:read erc20:read erc721:read point_rewards:read point_balances:read',
});
