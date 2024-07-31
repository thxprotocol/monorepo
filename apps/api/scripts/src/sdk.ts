import { THXAPIClient } from '@thxnetwork/sdk/clients';
import { API_URL, AUTH_URL } from '@thxnetwork/api/config/secrets';

export default async function main() {
    const thx = new THXAPIClient({
        authUrl: AUTH_URL,
        apiUrl: API_URL,
        apiKey: 'WtMTSdvSuLaCL7YVYgn2OBT9Bp/WV6xxcosLiqj9CWo=',
    });
    await thx.events.create({ event: 'level_up', identity: '1b2e70d0-4f49-11ef-a04a-ad8f0d78eac7' });
}
