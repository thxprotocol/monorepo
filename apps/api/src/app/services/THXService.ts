import { THXAPIClient } from '@thxnetwork/sdk/clients';
import { THX_CLIENT_ID, THX_CLIENT_SECRET } from '../config/secrets';
import { Identity, PoolDocument, Wallet } from '../models';
import { WalletVariant } from '@thxnetwork/common/enums';
import AccountProxy from '../proxies/AccountProxy';
import IdentityService from './IdentityService';

class THXService {
    thx!: THXAPIClient;

    constructor() {
        if (THX_CLIENT_ID && THX_CLIENT_SECRET) {
            this.thx = new THXAPIClient({
                clientId: THX_CLIENT_ID,
                clientSecret: THX_CLIENT_SECRET,
            });
        }
    }

    async connect(account: TAccount) {
        if (!this.thx) return;

        if (!account.identity) {
            account.identity = await this.thx.identity.create();
            await AccountProxy.update(account.sub, { identity: account.identity });
        }

        await Identity.updateOne({ uuid: account.identity }, { sub: account.sub });
    }

    async forceConnect(pool: PoolDocument, account: TAccount) {
        // Search for WalletConnect wallets for this sub
        const wallets = await Wallet.find({ sub: account.sub, variant: WalletVariant.WalletConnect });
        if (!wallets.length) return;

        // Create a list of uuids for these wallets
        const uuids = wallets.map((wallet) => IdentityService.getUUID(pool, wallet.address));

        // Find any identity for these uuids and update
        await Identity.findOneAndUpdate({ uuid: { $in: uuids } }, { sub: account.sub });
    }

    async createEvent(account: TAccount, event: string) {
        if (!this.thx || !account.identity) return;
        await this.thx.events.create({ identity: account.identity, event });
    }
}

export default new THXService();
