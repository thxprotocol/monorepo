import {
    Pool,
    RewardCoin,
    RewardNFT,
    RewardCustom,
    RewardCoupon,
    RewardDiscordRole,
    QuestDaily,
    QuestInvite,
    QuestSocial,
    QuestCustom,
    QuestWeb3,
    QuestGitcoin,
    Participant,
} from '@thxnetwork/api/models';
import { logger } from '../util/logger';

export async function updateCampaignRanks() {
    try {
        // Helper to create $lookup with pipeline for counting
        function countLookup(model) {
            return {
                $lookup: {
                    from: model.collection.name,
                    let: { poolId: { $toString: '$_id' } },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$poolId', '$$poolId'] } } },
                        { $count: 'count' }
                    ],
                    as: `${model.collection.name}Count`
                }
            };
        }

        const questModels = [QuestDaily, QuestInvite, QuestSocial, QuestCustom, QuestWeb3, QuestGitcoin];
        const rewardModels = [RewardCoin, RewardNFT, RewardCustom, RewardCoupon, RewardDiscordRole];

        // Lookups for counts only
        const questCountLookups = questModels.map(countLookup);
        const rewardCountLookups = rewardModels.map(countLookup);

        // Participant count lookup
        const participantCountLookup = countLookup(Participant);

        const campaigns = await Pool.aggregate([
            {
                $addFields: {
                    id: { $toString: '$_id' },
                },
            },
            participantCountLookup,
            ...questCountLookups,
            ...rewardCountLookups,
            {
                $addFields: {
                    participantCount: {
                        $ifNull: [{ $arrayElemAt: [`$${Participant.collection.name}Count.count`, 0] }, 0]
                    },
                    totalQuestCount: {
                        $sum: questModels.map(
                            (model) => ({
                                $ifNull: [
                                    { $arrayElemAt: [`$${model.collection.name}Count.count`, 0] },
                                    0
                                ]
                            })
                        )
                    },
                    totalRewardsCount: {
                        $sum: rewardModels.map(
                            (model) => ({
                                $ifNull: [
                                    { $arrayElemAt: [`$${model.collection.name}Count.count`, 0] },
                                    0
                                ]
                            })
                        )
                    },
                },
            },
            {
                $match: {
                    'settings.isPublished': true,
                    'totalQuestCount': { $gt: 0 },
                    'totalRewardsCount': { $gt: 0 },
                },
            },
            {
                $sort: { participantCount: -1 },
            },
        ]).exec();

        await Pool.bulkWrite(
            campaigns.map((campaign, index) => {
                return {
                    updateOne: {
                        filter: { _id: campaign._id },
                        update: { $set: { rank: Number(index) + 1 } },
                    },
                };
            }),
        );
    } catch (error) {
        logger.error(error);
    }
}
