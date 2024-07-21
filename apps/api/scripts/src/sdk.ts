import { THXAPIClient } from '@thxnetwork/sdk/clients';
import { API_URL, AUTH_URL } from '@thxnetwork/api/config/secrets';

export default async function main() {
    const thx = new THXAPIClient({
        authUrl: AUTH_URL,
        apiUrl: API_URL,
        clientId: 'ageY4VdoFq9pGQ_tTEm6K',
        clientSecret: 'GbWJ6ymtGIG5F05opjY2B4i-iSKpAgndrW8Huqs4IzV0k62chxX-pPOvcVFnFyVTGxmu3bEGj2W2NvNzz7CRvg',
    });
    await thx.events.create({ event: 'boss_kill', identity: 'd2844bb0-469d-11ef-8880-bfce5386ef6b' });
}
