import { Wallet } from '@thxnetwork/api/models';
import SafeService from '@thxnetwork/api/services/SafeService';
import { PromiseParser } from '@thxnetwork/api/util';
import { WalletVariant } from '@thxnetwork/common/enums';

export default async function main() {
    const query = {
        variant: WalletVariant.Safe,
        owners: { $exists: false },
        poolId: { $exists: true },
    };
    const walletsCount = await Wallet.countDocuments(query);
    console.log(`Updating ${walletsCount} wallets...`);

    const wallet = await Wallet.find(query);
    const chunkSize = 25;

    for (let i = 0; i < wallet.length; i += chunkSize) {
        await PromiseParser.parse(
            wallet.slice(i, i + chunkSize).map(async (w) => {
                const safe = await SafeService.getSafe(w);
                const owners = await safe.getOwners();

                await w.updateOne({ owners });
            }),
        );
    }
}
