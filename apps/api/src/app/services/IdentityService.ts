import { Identity, PoolDocument, Wallet } from '@thxnetwork/api/models';
import { uuidV1 } from '../util/uuid';
import AccountProxy from '../proxies/AccountProxy';
import { WalletVariant } from '@thxnetwork/common/enums';

class IdentityService {
    getUUID(sub: string, salt: string) {
        return uuidV1(`${sub}${salt}`);
    }

    // Derive uuid v1 from pool.sub + salt. Using uuid v1 format so we can
    // validate the input using express-validator
    async getIdentityForSalt(sub: string, salt: string) {
        const uuid = this.getUUID(sub, salt);
        const query = { sub, uuid };
        return await Identity.findOneAndUpdate(query, query, { new: true, upsert: true });
    }

    async list(sub: string, page: number, limit: number) {
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const total = await Identity.find({ sub }).countDocuments().exec();

        const identities = {
            previous: startIndex > 0 && {
                page: page - 1,
            },
            next: endIndex < total && {
                page: page + 1,
            },
            limit,
            total,
            results: await Identity.aggregate([
                { $match: { sub } },
                { $skip: startIndex },
                { $limit: limit },
                { $sort: { createdAt: -1 } },
            ]).exec(),
        };

        const subs = identities.results.filter(({ sub }) => !!sub).map(({ sub }) => sub);
        const accounts = await AccountProxy.find({ subs });

        identities.results = identities.results.map((identity: TIdentity) => ({
            ...identity,
            account: accounts.find(({ sub }) => sub && sub === identity.accountId),
        }));

        return identities;
    }

    async forceConnect(pool: PoolDocument, account: TAccount) {
        // Search for WalletConnect wallets for this sub
        const wallets = await Wallet.find({ sub: account.sub, variant: WalletVariant.WalletConnect });
        if (!wallets.length) return;

        // Create a list of uuids for these wallets
        const uuids = wallets.map((wallet) => this.getUUID(pool.sub, wallet.address));

        // Find any identity for these uuids and update
        await Identity.findOneAndUpdate({ uuid: { $in: uuids } }, { accountId: account.sub });
    }
}

export default new IdentityService();
