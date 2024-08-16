import { THXAPIClient } from '@thxnetwork/sdk/clients';
import { NODE_ENV, THX_CLIENT_SECRET } from '../config/secrets';
import { Identity } from '../models';
import AccountProxy from '../proxies/AccountProxy';

class THXService {
    thx!: THXAPIClient;

    constructor() {
        if (THX_CLIENT_SECRET) {
            this.thx = new THXAPIClient({
                apiKey: THX_CLIENT_SECRET,
            });
        }
    }

    async connect(account: TAccount) {
        if (!this.thx || NODE_ENV === 'development') return;

        if (!account.identity) {
            account.identity = await this.thx.identity.create();
            await AccountProxy.update(account.sub, { identity: account.identity });
        }

        await Identity.updateOne({ uuid: account.identity }, { accountId: account.sub });
    }

    async createEvent(account: TAccount, event: string) {
        if (!this.thx || !account.identity) return;
        await this.thx.events.create({ identity: account.identity, event });
    }
}

export default new THXService();
