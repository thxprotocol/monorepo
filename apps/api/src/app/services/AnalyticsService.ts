import mongoose from 'mongoose';
import { RewardCoinDocument, RewardCoin } from '@thxnetwork/api/models/RewardCoin';
import { RewardNFTDocument, RewardNFT } from '@thxnetwork/api/models/RewardNFT';
import { QuestInviteDocument, QuestInvite } from '@thxnetwork/api/models/QuestInvite';
import {
    PoolDocument,
    RewardCustomDocument,
    QuestCustomDocument,
    QuestSocialDocument,
    QuestWeb3Document,
    QuestWeb3,
    QuestSocialEntry,
    QuestInviteEntry,
    QuestWeb3Entry,
    RewardCoinPayment,
    RewardNFTPayment,
    Participant,
    RewardCouponDocument,
    RewardCustom,
    RewardDiscordRoleDocument,
    RewardCouponPayment,
    RewardCustomPayment,
    RewardDiscordRolePayment,
    RewardCoupon,
    RewardDiscordRole,
    QuestCustomEntry,
    QuestDailyEntry,
    QuestCustom,
    QuestSocial,
    QuestDailyDocument,
    QuestDaily,
    QuestGitcoin,
    QuestGitcoinEntry,
    RewardGalachainDocument,
    RewardGalachain,
    QuestGitcoinDocument,
    RewardGalachainPayment,
    QuestWebhookEntry,
    QuestWebhook,
    QuestWebhookDocument,
    Pool,
} from '@thxnetwork/api/models';
import { subWeeks } from 'date-fns';
import { logger } from '../util/logger';

class AnalyticsService {
    public leaderboards: { [poolId: string]: TLeaderboardEntry[] } = {};

    constructor() {
        //
    }

    // Triggered when a quest entry is added
    async updateLeaderboardJob(job: TJob) {
        logger.debug('UpdateLeaderboard Start', job.attrs.data);
        try {
            const { poolId } = job.attrs.data;
            const pool = await Pool.findById(poolId);
            const endDate = new Date();
            const startDate = subWeeks(endDate, pool.settings.leaderboardInWeeks);
            const leaderboard = await this.createLeaderboard(pool, { startDate, endDate });

            this.cacheLeaderboard(poolId, leaderboard);
        } catch (error) {
            logger.error('UpdateLeaderboard Failed:', error);
        }
    }

    cacheLeaderboard(poolId: string, leaderboard: TLeaderboardEntry[]) {
        this.leaderboards[poolId] = leaderboard;
    }

    async createLeaderboard(pool: PoolDocument, options?: { startDate: Date; endDate: Date }) {
        const collections = [
            QuestDailyEntry,
            QuestSocialEntry,
            QuestInviteEntry,
            QuestCustomEntry,
            QuestWeb3Entry,
            QuestGitcoinEntry,
            QuestWebhookEntry,
        ];

        // Extend the $match filter with optional dateRange
        const $match = { poolId: pool.id };
        if (options) {
            $match['createdAt'] = { $gte: options.startDate, $lte: options.endDate };
        }

        let result = [];
        const chunkSize = 1000;
        for (const Model of collections) {
            let chunk = [];
            let skip = 0;
            let currentChunk;

            do {
                currentChunk = await Model.aggregate([
                    { $match },
                    {
                        $group: {
                            _id: '$sub',
                            questEntryCount: { $sum: 1 },
                            score: { $sum: { $convert: { input: '$amount', to: 'int' } } },
                        },
                    },
                    { $skip: skip },
                    { $limit: chunkSize },
                ]);

                chunk = chunk.concat(currentChunk);
                skip += chunkSize;
            } while (currentChunk.length === chunkSize);

            result = result.concat(chunk);
        }

        // Combine results from all collections and calculate overall totals
        const totals = {};
        for (const r of result) {
            if (!r) continue;
            if (totals[r._id]) {
                totals[r._id].questEntryCount += r.questEntryCount;
                totals[r._id].score += r.score;
            } else {
                totals[r._id] = {
                    questEntryCount: r.questEntryCount,
                    score: r.score,
                };
            }
        }
        // Add participant data to leaderboard
        const subs = Object.keys(totals);
        const participants = await Participant.find({ poolId: pool.id, sub: { $in: subs } });
        const leaderboard = participants
            .map((p) => ({
                sub: p.sub,
                score: totals[p.sub].score || 0,
                questEntryCount: totals[p.sub].questEntryCount || 0,
            }))
            .filter((entry) => entry.score > 0)
            .sort((a: any, b: any) => b.score - a.score);

        return leaderboard;
    }

    async getPoolAnalyticsForChart(pool: PoolDocument, startDate: Date, endDate: Date) {
        // Rewards
        const [
            erc20PerksQueryResult,
            erc721PerksQueryResult,
            customRewardsQueryResult,
            couponRewardsQueryResult,
            discordRoleRewardsQueryResult,
            galachainRewardsQueryResult,
        ] = await Promise.all([
            this.queryRewardRedemptions<RewardCoinDocument>({
                collectionName: 'rewardcoinpayment',
                key: 'rewardId',
                model: RewardCoin,
                poolId: String(pool._id),
                startDate,
                endDate,
            }),
            this.queryRewardRedemptions<RewardNFTDocument>({
                collectionName: 'rewardnftpayment',
                key: 'rewardId',
                model: RewardNFT,
                poolId: String(pool._id),
                startDate,
                endDate,
            }),
            this.queryRewardRedemptions<RewardCustomDocument>({
                collectionName: 'rewardcustompayment',
                key: 'rewardId',
                model: RewardCustom,
                poolId: String(pool._id),
                startDate,
                endDate,
            }),
            this.queryRewardRedemptions<RewardCouponDocument>({
                collectionName: 'rewardcouponpayment',
                key: 'rewardId',
                model: RewardCoupon,
                poolId: String(pool._id),
                startDate,
                endDate,
            }),
            this.queryRewardRedemptions<RewardDiscordRoleDocument>({
                collectionName: 'rewarddiscordrolepayment',
                key: 'rewardId',
                model: RewardDiscordRole,
                poolId: String(pool._id),
                startDate,
                endDate,
            }),
            this.queryRewardRedemptions<RewardGalachainDocument>({
                collectionName: 'rewargalachainpayment',
                key: 'rewardId',
                model: RewardGalachain,
                poolId: String(pool._id),
                startDate,
                endDate,
            }),
        ]);

        // Quests
        const [
            milestoneRewardsQueryResult,
            referralRewardsQueryResult,
            pointRewardsQueryResult,
            dailyRewardsQueryResult,
            web3QuestsQueryResult,
            gitcoinQuestsQueryResult,
            webhookQuestsQueryResult,
        ] = await Promise.all([
            this.queryQuestEntries<QuestCustomDocument>({
                collectionName: 'questcustomentry',
                key: 'questId',
                model: QuestCustom,
                poolId: String(pool._id),
                startDate,
                endDate,
                extraFilter: { isClaimed: true },
            }),
            this.queryQuestEntries<QuestInviteDocument>({
                collectionName: 'questinviteentry',
                key: 'questId',
                model: QuestInvite,
                poolId: String(pool._id),
                startDate,
                endDate,
                extraFilter: { isApproved: true },
            }),
            this.queryQuestEntries<QuestSocialDocument>({
                collectionName: 'questsocialentry',
                key: 'questId',
                model: QuestSocial,
                poolId: String(pool._id),
                startDate,
                endDate,
            }),
            this.queryQuestEntries<QuestDailyDocument>({
                collectionName: 'questdailyentry',
                key: 'questId',
                model: QuestDaily,
                poolId: String(pool._id),
                startDate,
                endDate,
            }),
            this.queryQuestEntries<QuestWeb3Document>({
                collectionName: 'questweb3entry',
                key: 'questId',
                model: QuestWeb3,
                poolId: String(pool._id),
                startDate,
                endDate,
            }),
            this.queryQuestEntries<QuestGitcoinDocument>({
                collectionName: 'questgitcoinentry',
                key: 'questId',
                model: QuestGitcoin,
                poolId: String(pool._id),
                startDate,
                endDate,
            }),
            this.queryQuestEntries<QuestWebhookDocument>({
                collectionName: 'questwebhookentry',
                key: 'questId',
                model: QuestWebhook,
                poolId: String(pool._id),
                startDate,
                endDate,
            }),
        ]);

        const result = {
            _id: pool._id,
            erc20Perks: erc20PerksQueryResult.map((x) => {
                return {
                    day: x._id,
                    totalAmount: x.total_amount,
                };
            }),
            erc721Perks: erc721PerksQueryResult.map((x) => {
                return {
                    day: x._id,
                    totalAmount: x.total_amount,
                };
            }),
            customRewards: customRewardsQueryResult.map((x) => {
                return {
                    day: x._id,
                    totalAmount: x.total_amount,
                };
            }),
            couponRewards: couponRewardsQueryResult.map((x) => {
                return {
                    day: x._id,
                    totalAmount: x.total_amount,
                };
            }),
            discordRoleRewards: discordRoleRewardsQueryResult.map((x) => {
                return {
                    day: x._id,
                    totalAmount: x.total_amount,
                };
            }),
            galachainRewards: galachainRewardsQueryResult.map((x) => {
                return {
                    day: x._id,
                    totalAmount: x.total_amount,
                };
            }),
            //
            dailyRewards: dailyRewardsQueryResult.map((x) => {
                return {
                    day: x._id,
                    totalAmount: x.total_amount,
                };
            }),
            milestoneRewards: milestoneRewardsQueryResult.map((x) => {
                return {
                    day: x._id,
                    totalAmount: x.total_amount,
                };
            }),
            referralRewards: referralRewardsQueryResult.map((x) => {
                return {
                    day: x._id,
                    totalAmount: x.total_amount,
                };
            }),
            pointRewards: pointRewardsQueryResult.map((x) => {
                return {
                    day: x._id,
                    totalAmount: x.total_amount,
                };
            }),
            web3Quests: web3QuestsQueryResult.map((x) => {
                return {
                    day: x._id,
                    totalAmount: x.total_amount,
                };
            }),
            gitcoinQuests: gitcoinQuestsQueryResult.map((x) => {
                return {
                    day: x._id,
                    totalAmount: x.total_amount,
                };
            }),
            webhookQuests: webhookQuestsQueryResult.map((x) => {
                return {
                    day: x._id,
                    totalAmount: x.total_amount,
                };
            }),
        };
        return result;
    }

    async getPoolMetrics(pool: PoolDocument, dateRange?: { startDate: Date; endDate: Date }) {
        const collections = [
            QuestDailyEntry,
            QuestSocialEntry,
            QuestInviteEntry,
            QuestCustomEntry,
            QuestWeb3Entry,
            QuestGitcoinEntry,
            QuestWebhookEntry,
            RewardCoinPayment,
            RewardNFTPayment,
            RewardCustomPayment,
            RewardCouponPayment,
            RewardDiscordRolePayment,
            RewardGalachainPayment,
        ];
        const [
            dailyQuest,
            socialQuest,
            inviteQuest,
            customQuest,
            web3Quest,
            gitcoinQuest,
            webhookQuest,
            coinReward,
            nftReward,
            customReward,
            couponReward,
            discordRoleReward,
            galachainReward,
        ] = await Promise.all(
            collections.map(async (Model) => {
                const $match = { poolId: String(pool._id) };
                if (dateRange) {
                    $match['createdAt'] = { $gte: dateRange.startDate, $lte: dateRange.endDate };
                }

                // Extend the $match filter with model specific properties
                switch (Model) {
                    case QuestDailyEntry:
                        $match['state'] = 1;
                        break;
                    case QuestCustomEntry:
                        $match['isClaimed'] = true;
                        break;
                }

                const [result] = await Model.aggregate([
                    { $match },
                    {
                        $group: {
                            _id: '$poolId',
                            totalCompleted: { $sum: 1 },
                            totalAmount: { $sum: { $convert: { input: '$amount', to: 'int' } } },
                        },
                    },
                ]);

                const query = { poolId: pool.id };
                if (dateRange) {
                    query['createdAt'] = { $gte: dateRange.startDate, $lte: dateRange.endDate };
                }
                const totalCreated = await Model.countDocuments(query);

                return {
                    totalCompleted: result && result.totalCompleted ? result.totalCompleted : 0,
                    totalAmount: result && result.totalAmount ? result.totalAmount : 0,
                    totalCreated,
                };
            }),
        );

        return {
            dailyQuest,
            socialQuest,
            inviteQuest,
            customQuest,
            web3Quest,
            gitcoinQuest,
            webhookQuest,
            coinReward,
            nftReward,
            customReward,
            couponReward,
            discordRoleReward,
            galachainReward,
        };
    }

    async queryQuestEntries<T>(args: {
        model: mongoose.Model<T>;
        poolId: string;
        collectionName: string;
        key: string;
        startDate: Date;
        endDate: Date;
        extraFilter?: object;
    }) {
        const extraFilter = args.extraFilter ? { ...args.extraFilter } : {};
        const queryResult = await args.model.aggregate([
            {
                $match: {
                    poolId: args.poolId,
                },
            },
            {
                $lookup: {
                    from: args.collectionName,
                    let: {
                        id: {
                            $convert: {
                                input: '$_id',
                                to: 'string',
                            },
                        },
                    },
                    pipeline: [
                        {
                            $match: {
                                $and: [
                                    {
                                        $expr: {
                                            $eq: ['$$id', `$${args.key}`],
                                        },
                                    },
                                    {
                                        createdAt: {
                                            $gte: args.startDate,
                                            $lte: args.endDate,
                                        },
                                    },
                                    extraFilter,
                                ],
                            },
                        },
                    ],
                    as: 'entries',
                },
            },
            {
                $unwind: '$entries',
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: '%Y-%m-%d',
                            date: { $toDate: '$entries.createdAt' },
                        },
                    },
                    total_amount: {
                        $sum: 1,
                    },
                },
            },
        ]);

        return queryResult;
    }

    async queryRewardRedemptions<T>(args: {
        model: mongoose.Model<T>;
        poolId: string;
        collectionName: string;
        key: string;
        startDate: Date;
        endDate: Date;
        extraFilter?: object;
    }) {
        const extraFilter = args.extraFilter ? { ...args.extraFilter } : {};
        const queryResult = await args.model.aggregate([
            {
                $match: {
                    poolId: args.poolId,
                },
            },
            {
                $lookup: {
                    from: args.collectionName,
                    let: {
                        id: {
                            $convert: {
                                input: '$_id',
                                to: 'string',
                            },
                        },
                    },
                    pipeline: [
                        {
                            $match: {
                                $and: [
                                    {
                                        $expr: {
                                            $eq: ['$$id', `$${args.key}`],
                                        },
                                    },
                                    {
                                        createdAt: {
                                            $gte: args.startDate,
                                            $lte: args.endDate,
                                        },
                                    },
                                    extraFilter,
                                ],
                            },
                        },
                    ],
                    as: 'entries',
                },
            },
            {
                $unwind: '$entries',
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: '%Y-%m-%d',
                            date: { $toDate: '$entries.createdAt' },
                        },
                    },
                    total_amount: {
                        $sum: 1,
                    },
                },
            },
        ]);

        return queryResult;
    }
}

export default new AnalyticsService();
