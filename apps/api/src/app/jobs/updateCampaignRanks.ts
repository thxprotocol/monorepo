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
        const BATCH_SIZE = 100; // Process campaigns in batches of 100

        // Helper to create $lookup with pipeline for counting
        const countLookup = (model) => {
            return {
                $lookup: {
                    from: model.collection.name,
                    let: { poolId: { $toString: '$_id' } },
                    pipeline: [{ $match: { $expr: { $eq: ['$poolId', '$$poolId'] } } }, { $count: 'count' }],
                    as: `${model.collection.name}Count`,
                },
            };
        };

        const questModels = [QuestDaily, QuestInvite, QuestSocial, QuestCustom, QuestWeb3, QuestGitcoin];
        const rewardModels = [RewardCoin, RewardNFT, RewardCustom, RewardCoupon, RewardDiscordRole];

        // Lookups for counts only
        const questCountLookups = questModels.map(countLookup);
        const rewardCountLookups = rewardModels.map(countLookup);
        const participantCountLookup = countLookup(Participant);

        // Get total count of published campaigns
        const totalCampaigns = await Pool.countDocuments({
            'settings.isPublished': true,
        });

        // Process campaigns in batches
        for (let skip = 0; skip < totalCampaigns; skip += BATCH_SIZE) {
            const campaigns = await Pool.aggregate([
                {
                    $match: {
                        'settings.isPublished': true,
                    },
                },
                {
                    $skip: skip,
                },
                {
                    $limit: BATCH_SIZE,
                },
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
                            $ifNull: [{ $arrayElemAt: [`$${Participant.collection.name}Count.count`, 0] }, 0],
                        },
                        totalQuestCount: {
                            $sum: questModels.map((model) => ({
                                $ifNull: [{ $arrayElemAt: [`$${model.collection.name}Count.count`, 0] }, 0],
                            })),
                        },
                        totalRewardsCount: {
                            $sum: rewardModels.map((model) => ({
                                $ifNull: [{ $arrayElemAt: [`$${model.collection.name}Count.count`, 0] }, 0],
                            })),
                        },
                    },
                },
                {
                    $match: {
                        totalQuestCount: { $gt: 0 },
                        totalRewardsCount: { $gt: 0 },
                    },
                },
                {
                    $sort: { participantCount: -1 },
                },
            ]).exec();

            if (campaigns.length > 0) {
                // Calculate rank based on the current batch and skip value
                await Pool.bulkWrite(
                    campaigns.map((campaign, index) => ({
                        updateOne: {
                            filter: { _id: campaign._id },
                            update: { $set: { rank: skip + index + 1 } },
                        },
                    })),
                );
            }
        }

        logger.info('Successfully updated campaign ranks');
    } catch (error) {
        logger.error('Failed to update campaign ranks:', error);
        throw error;
    }
}
