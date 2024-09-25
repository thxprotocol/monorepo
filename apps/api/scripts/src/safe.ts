import { Wallet } from '@thxnetwork/api/models';
import SafeService from '@thxnetwork/api/services/SafeService';
import { PromiseParser } from '@thxnetwork/api/util';
import { WalletVariant } from '@thxnetwork/common/enums';

export default async function main() {
    const wallet = await Wallet.find({ variant: WalletVariant.Safe, poolId: { $exists: true } });
    const chunkSize = 10;

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
