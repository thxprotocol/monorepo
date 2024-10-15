import { QRCodeEntry, RewardNFT } from '@thxnetwork/api/models';
import { PromiseParser } from '@thxnetwork/api/util';

export default async function main() {
    const chunkSize = 1000;

    let skip = 0;
    let entries = [];
    console.log('start while', entries.length);
    while (true) {
        entries = await QRCodeEntry.find().skip(skip).limit(chunkSize).exec();
        if (!entries.length) break;

        const operations = (
            await PromiseParser.parse(
                entries.map(async (entry) => {
                    const reward = await RewardNFT.findById(entry.rewardId);
                    if (!reward) return;

                    const update = {};
                    if (reward.erc721Id) update['erc721Id'] = reward.erc721Id;
                    if (reward.metadataId) update['erc721MetadataId'] = reward.metadataId;

                    return {
                        updateOne: {
                            filter: { _id: entry._id },
                            update: {
                                $set: update,
                            },
                        },
                    };
                }),
            )
        ).filter((o) => !!o);

        await QRCodeEntry.bulkWrite(operations);

        skip += chunkSize;
    }
}
