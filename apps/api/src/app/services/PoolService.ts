import { AccessTokenKind, ChainId, CollaboratorInviteState, OAuthDiscordScope } from '@thxnetwork/common/enums';
import { v4 } from 'uuid';
import { AccountVariant } from '@thxnetwork/common/enums';
import { DASHBOARD_URL } from '../config/secrets';
import { DEFAULT_COLORS, DEFAULT_ELEMENTS } from '@thxnetwork/common/constants';
import { logger } from '../util/logger';
import {
    Pool,
    PoolDocument,
    RewardCoin,
    RewardNFT,
    Collaborator,
    CollaboratorDocument,
    Client,
    DiscordGuild,
    Participant,
    QuestInvite,
    QuestWeb3,
    QuestCustom,
    RewardCustom,
    Widget,
    QuestSocial,
    QuestDaily,
    CouponCode,
    WalletDocument,
    Brand,
} from '@thxnetwork/api/models';

import AccountProxy from '../proxies/AccountProxy';
import DiscordDataProxy from '../proxies/DiscordDataProxy';
import MailService from './MailService';
import ParticipantService from './ParticipantService';
import DiscordService from './DiscordService';
import ContractService from './ContractService';
import AnalyticsService from './AnalyticsService';

export const ADMIN_ROLE = '0x0000000000000000000000000000000000000000000000000000000000000000';

async function isAudienceAllowed(aud: string, poolId: string) {
    return !!(await Client.exists({ clientId: aud, poolId }));
}

async function isSubjectAllowed(sub: string, poolId: string) {
    const pool = await Pool.findById(poolId);
    const isOwner = pool && pool.sub === sub;
    const isCollaborator = await Collaborator.exists({ sub, poolId, state: CollaboratorInviteState.Accepted });

    return isOwner || isCollaborator;
}

async function getById(id: string) {
    return await Pool.findById(id);
}

function getByAddress(address: string) {
    return Pool.findOne({ address });
}

async function getLeaderboardFromCache(pool: PoolDocument, options: { startDate: Date; endDate: Date }) {
    if (AnalyticsService.leaderboards[pool.id]) {
        return AnalyticsService.leaderboards[pool.id];
    }

    // If not cached create the leaderboard and store in cache
    const leaderboard = await AnalyticsService.createLeaderboard(pool, options);
    AnalyticsService.cacheLeaderboard(pool.id, leaderboard);
    return leaderboard;
}

async function createLeaderboard(pool: PoolDocument, options: { startDate: Date; endDate: Date }) {
    return await AnalyticsService.createLeaderboard(pool, options);
}

async function getLeaderboardTop(leaderboard: TLeaderboardEntry[], limit: number) {
    const topTen = leaderboard.slice(0, limit);
    const subs = topTen.map((p) => p.sub);
    const accounts = await AccountProxy.find({ subs });
    return topTen.map((p, index) => {
        const account = accounts.find((a) => a.sub === p.sub);

        return {
            rank: Number(index) + 1,
            account: account
                ? { username: account.username, profileImg: account.profileImg }
                : { username: 'Removed account', profileImg: '' },
            score: p.score,
            questEntryCount: p.questEntryCount,
        };
    });
}

async function deploy(sub: string, title: string): Promise<PoolDocument> {
    const pool = await Pool.create({
        sub,
        token: v4(),
        settings: {
            title,
            description: '',
            leaderboardInWeeks: 4,
            isPublished: false,
            isWeeklyDigestEnabled: true,
            authenticationMethods: [
                AccountVariant.EmailPassword,
                AccountVariant.Metamask,
                AccountVariant.SSOGoogle,
                AccountVariant.SSODiscord,
            ],
        },
    });

    await Widget.create({
        uuid: v4(),
        poolId: pool._id,
        align: 'right',
        message: 'Hi there!👋 Click me to complete quests and earn rewards...',
        domain: 'https://www.example.com',
        theme: JSON.stringify({ elements: DEFAULT_ELEMENTS, colors: DEFAULT_COLORS }),
    });

    return await Pool.findByIdAndUpdate(pool.id, { 'settings.slug': pool.id }, { new: true });
}

async function getAllBySub(sub: string): Promise<PoolDocument[]> {
    let pools = await Pool.find({ sub });

    // Only query for collabs of not already owned pools
    const collaborations = await Collaborator.find({ sub, poolId: { $nin: pools.map(({ _id }) => String(_id)) } });
    const poolIds = collaborations.map((c) => c.poolId);
    if (poolIds.length) {
        const collaborationPools = await Pool.find({ _id: poolIds });
        pools = pools.concat(collaborationPools);
    }

    // Get usernames for pool owners
    const subs = pools.map((p) => p.sub);
    const accounts = await AccountProxy.find({ subs });

    // Add Safes to pools
    return await Promise.all(
        pools.map(async (pool) => {
            try {
                const brand = await Brand.findOne({ poolId: pool.id });
                const participantCount = await Participant.countDocuments({ poolId: pool.id });
                const account = accounts.find((a) => a.sub === pool.sub);
                const author = account && {
                    username: account.username,
                };
                return { ...pool.toJSON(), participantCount, author, brand };
            } catch (error) {
                console.log(error);
            }
        }),
    );
}

function getAll() {
    return Pool.find({});
}

async function balanceOf(safe: WalletDocument) {
    const contract = ContractService.getContract('USDC', safe.chainId, safe.address);
    return await contract.balanceOf(safe.address);
}

async function countByNetwork(chainId: ChainId) {
    return Pool.countDocuments({ chainId });
}

async function find(model: any, pool: PoolDocument) {
    return await model.find({ poolId: String(pool._id) });
}

async function findOwner(pool: PoolDocument) {
    const account = await AccountProxy.findById(pool.sub);
    if (!account) return;
    return await AccountProxy.decorate(account);
}

async function getQuestCount(pool: PoolDocument) {
    const result = await Promise.all(
        [QuestDaily, QuestInvite, QuestSocial, QuestCustom, QuestWeb3].map(async (model) => await find(model, pool)),
    );
    return Array.from(new Set(result.flat(1)));
}

async function getRewardCount(pool: PoolDocument) {
    const result = await Promise.all(
        [RewardCoin, RewardNFT, RewardCustom].map(async (model) => await find(model, pool)),
    );
    return Array.from(new Set(result.flat(1)));
}

async function findCouponCodes(
    { couponRewardId, query }: { couponRewardId: string; query: string },
    page: number,
    limit: number,
) {
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const $match = { couponRewardId };
    if (query && query.length > 1) {
        $match['code'] = { $regex: query, $options: 'i' };
    }

    const total = await CouponCode.find($match).countDocuments();
    const results = await CouponCode.aggregate([{ $match }, { $skip: startIndex }, { $limit: limit }]).exec();
    // Get subs for results
    const subs = results.map(({ sub }) => sub);
    // Get accounts for subs
    const accounts = await AccountProxy.find({ subs });

    return {
        previous: startIndex > 0 && {
            page: page - 1,
        },
        next: endIndex < total && {
            page: page + 1,
        },
        total,
        results: results.map((result) => {
            const account = accounts.find(({ sub }) => sub === result.sub);
            result.account = account;
            return result;
        }),
    };
}

async function findParticipants(pool: PoolDocument, page: number, limit: number, query = '') {
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const poolId = pool.id;
    const total = await Participant.countDocuments({ poolId });
    const $match = { poolId };

    let accounts = [],
        subs = [];

    // If a query is provided first get the accounts and subs based on the query
    if (query) {
        accounts = await AccountProxy.find({ query });
        subs = accounts.map((a) => a.sub);
        $match['sub'] = { $in: subs };
    }

    const results = await Participant.aggregate([
        { $match },
        {
            $addFields: {
                rankSort: {
                    $cond: {
                        if: { $gt: ['$rank', 0] },
                        then: '$rank',
                        else: Number.MAX_SAFE_INTEGER,
                    },
                },
            },
        },
        { $sort: { rankSort: 1 } },
        { $skip: startIndex },
        { $limit: limit },
    ]).exec();

    // If a query was provided dont get accounts and subs based on participants
    if (!query) {
        subs = results.map((p) => p.sub);
        accounts = await AccountProxy.find({ subs });
    }

    // Format the output
    const participants = {
        previous: startIndex > 0 && {
            page: page - 1,
        },
        next: endIndex < total && {
            page: page + 1,
        },
        total,
        results,
    };

    // Try to get the guild for the pool in case bot is in the server
    const guild = await DiscordService.getGuild(poolId);

    participants.results = await Promise.all(
        participants.results.map(async (participant, index) => {
            let account: TAccount;

            try {
                account = accounts.find((a) => a.sub === participant.sub);
                account.tokens = await Promise.all(
                    account.tokens.map(async (token: TToken) =>
                        ParticipantService.findUser(token, { userId: token.userId, guildId: guild && guild.id }),
                    ),
                );
            } catch (error) {
                logger.error(error);
            }

            return {
                ...participant,
                account: account && {
                    email: account.email,
                    username: account.username,
                    profileImg: account.profileImg,
                    variant: account.variant,
                    tokens: account.tokens,
                },
            };
        }),
    );

    return participants;
}

async function getParticipantCount(pool: PoolDocument) {
    return await Participant.countDocuments({ poolId: pool._id });
}

async function inviteCollaborator(pool: PoolDocument, email: string) {
    const uuid = v4();
    let collaborator = await Collaborator.findOne({ email, poolId: pool._id });

    if (collaborator) {
        collaborator = await Collaborator.findByIdAndUpdate(collaborator._id, { uuid }, { new: true });
    } else {
        collaborator = await Collaborator.create({
            email,
            uuid,
            poolId: pool._id,
            state: CollaboratorInviteState.Pending,
        });
    }

    const url = new URL(DASHBOARD_URL);
    url.pathname = 'collaborator';
    url.searchParams.append('poolId', pool._id);
    url.searchParams.append('collaboratorRequestToken', collaborator.uuid);

    await MailService.send(
        email,
        `👋 Collaboration Request: ${pool.settings.title}`,
        `<p>Hi!👋</p><p>You have received a collaboration request for Quest &amp; Reward campaign: <strong>${pool.settings.title}</strong></p>`,
        { src: url.href, text: 'Accept Request' },
    );

    return collaborator;
}

async function getAccountGuilds(account: TAccount) {
    // Try as this is potentially rate limited due to subsequent GET pool for id requests
    try {
        const token = await AccountProxy.getToken(account, AccessTokenKind.Discord, [
            OAuthDiscordScope.Identify,
            OAuthDiscordScope.Guilds,
        ]);
        return DiscordDataProxy.getGuilds(token);
    } catch (error) {
        return [];
    }
}

async function findGuilds(pool: PoolDocument) {
    const account = await AccountProxy.findById(pool.sub);
    const userGuilds = await getAccountGuilds(account);
    const guilds = await DiscordGuild.find({ poolId: pool._id });
    const promises = userGuilds.map(async (userGuild: { id: string; name: string }) => {
        const guild = guilds.find(({ guildId }) => guildId === userGuild.id);
        return await DiscordDataProxy.getGuild({
            ...(guild && guild.toJSON()),
            ...userGuild,
            guildId: userGuild.id,
            poolId: pool._id,
            isConnected: !!guild,
        });
    });

    return await Promise.all(promises);
}

async function findCollaborators(pool: PoolDocument) {
    const collabs = await Collaborator.find({ poolId: pool._id });
    const promises = collabs.map(async (collaborator: CollaboratorDocument) => {
        if (collaborator.sub) {
            const account = await AccountProxy.findById(collaborator.sub);
            return { ...collaborator.toJSON(), account };
        }
        return collaborator;
    });
    return await Promise.all(promises);
}

export default {
    isAudienceAllowed,
    isSubjectAllowed,
    getById,
    getByAddress,
    deploy,
    balanceOf,
    getAllBySub,
    getAll,
    countByNetwork,
    getParticipantCount,
    getQuestCount,
    getRewardCount,
    findOwner,
    findParticipants,
    findGuilds,
    findCollaborators,
    findCouponCodes,
    inviteCollaborator,
    getLeaderboardTop,
    getLeaderboardFromCache,
    createLeaderboard,
};
