import { QRCodeEntry, RewardNFT } from '@thxnetwork/api/models';
import PoolService from '@thxnetwork/api/services/PoolService';
import { PromiseParser } from '@thxnetwork/api/util';

export default async function main() {
    const chunkSize = 1000;

    let skip = 0;
    let entries = [];
    console.log('start while', entries.length);
    while (true) {
        entries = await QRCodeEntry.find().skip(skip).limit(chunkSize).exec();
        if (!entries.length) break;

        const operations = await PromiseParser.parse(
            entries.map(async (entry) => {
                const reward = await RewardNFT.findById(entry.rewardId);
                const pool = await PoolService.getById(reward.poolId);
                const owner = await PoolService.findOwner(pool);
                return {
                    updateOne: {
                        filter: { _id: entry._id },
                        update: {
                            $set: {
                                accountId: owner._id,
                            },
                        },
                    },
                };
            }),
        );

        console.log(operations.length);
        await QRCodeEntry.bulkWrite(operations);

        skip += chunkSize;
    }
}
