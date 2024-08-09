import { Request } from 'express';
import { JobType, QuestSocialRequirement, QuestVariant } from '@thxnetwork/common/enums';
import { PoolDocument, Participant, DiscordReaction, DiscordMessage, TwitterUser } from '@thxnetwork/api/models';
import { v4 } from 'uuid';
import { agenda } from '../util/agenda';
import { logger } from '../util/logger';
import { Job } from '@hokify/agenda';
import { IQuestInviteService, serviceMap } from './interfaces/IQuestService';
import { NODE_ENV } from '../config/secrets';
import PoolService from './PoolService';
import NotificationService from './NotificationService';
import PointBalanceService from './PointBalanceService';
import LockService from './LockService';
import ImageService from './ImageService';
import AccountProxy from '../proxies/AccountProxy';
import ParticipantService from './ParticipantService';
import THXService from './THXService';
import QuestSocialService from './QuestSocialService';
import DiscordService from './DiscordService';
import { PromiseParser } from '../util/promise';
import { getIP } from '../util/ip';
import { QuestEntryStatus } from '@thxnetwork/common/enums';

export default class QuestService {
    static async getDataForRequest(variant: QuestVariant, req: Request, options) {
        const data = await serviceMap[variant].getDataForRequest(req, options);
        // Use IP address for valiation of quest entry
        return { ...data, ip: getIP(req), recaptcha: req.body.recaptcha };
    }

    static async count({ poolId }) {
        const variants = Object.keys(QuestVariant).filter((v) => !isNaN(Number(v)));
        const counts = await Promise.all(
            variants.map(async (variant: string) => {
                const Quest = serviceMap[variant].models.quest;
                return await Quest.countDocuments({ poolId, isPublished: true });
            }),
        );
        return counts.reduce((acc, count) => acc + count, 0);
    }

    static async list({ pool, data, account }: { pool: PoolDocument; data: Partial<TQuestEntry>; account?: TAccount }) {
        const questVariants = Object.keys(QuestVariant).filter((v) => !isNaN(Number(v)));
        const author = await AccountProxy.findById(pool.sub);
        const callback: any = async (variant: QuestVariant) => {
            const Quest = serviceMap[variant].models.quest;
            const quests = await Quest.find({
                variant,
                poolId: pool.id,
                isPublished: true,
                $or: [
                    // Include quests with expiryDate less than or equal to now
                    { expiryDate: { $exists: true, $gte: new Date() } },
                    // Include quests with no expiryDate
                    { expiryDate: { $exists: false } },
                    { expiryDate: null },
                ],
            });

            return (
                await Promise.all(
                    quests.map(async (q) => {
                        try {
                            const quest = q.toJSON() as TQuest;
                            const decorated = await serviceMap[variant].decorate({ quest, account, data });
                            const isLocked = await LockService.getIsLocked(quest.locks, account);
                            const isExpired = this.isExpired(quest);
                            const QuestEntry = serviceMap[variant].models.entry;
                            const distinctSubs = await QuestEntry.countDocuments({ questId: q.id }).distinct('sub');
                            const entriesPendingReview = await this.getEntriesPendingReview(quest, account);

                            return {
                                ...decorated,
                                entriesPendingReview,
                                entryCount: distinctSubs.length,
                                author: { username: author.username },
                                isLocked,
                                isExpired,
                            };
                        } catch (error) {
                            logger.error(error);
                        }
                    }),
                )
            ).filter((result) => !!result);
        };

        return await Promise.all(questVariants.map(callback));
    }

    static async update(quest: TQuest, updates: Partial<TQuest>, file?: Express.Multer.File) {
        if (file) {
            updates.image = await ImageService.upload(file);
        }

        // We only want to notify when the quest is set to published (and not updated while published already)
        if (updates.isPublished && Boolean(updates.isPublished) !== quest.isPublished) {
            await NotificationService.notify(quest.variant, {
                ...quest,
                ...updates,
                image: updates.image || quest.image,
            });
        }

        return await this.updateById(quest.variant, quest._id, updates);
    }

    static async updateEntries(quest: TQuest, updates: { entryId: string; status: QuestEntryStatus }[]) {
        const Entry = serviceMap[quest.variant].models.entry;
        const entryIds = updates.map(({ entryId }) => entryId);
        const entries = await Entry.find({ _id: { $in: entryIds } });
        const accounts = await AccountProxy.find({ subs: entries.map(({ sub }) => sub) });
        const pool = await PoolService.getById(quest.poolId);

        // Update entry status
        const operations = updates
            // Only process status changes
            .filter(({ entryId, status }) => entries.find((e) => e.id === entryId).status !== status)
            .map(({ entryId, status }) => ({
                updateOne: {
                    filter: { _id: entryId },
                    update: { status },
                },
            }));
        await Entry.bulkWrite(operations);

        // Update point balances for entries
        for (const { entryId, status } of updates) {
            try {
                const entry = entries.find((e) => e.id === entryId);
                if (!entry) throw new Error('Entry not found');

                const account = accounts.find((a) => a.sub === entry.sub);
                if (!account) throw new Error('Account not found');

                switch (status) {
                    case QuestEntryStatus.Approved:
                        await PointBalanceService.add(pool, account, entry.amount);
                        break;
                    case QuestEntryStatus.Rejected:
                        await PointBalanceService.subtract(pool, account, entry.amount);
                        break;
                }
            } catch (error) {
                logger.error('UpdateEntry failed', { error });
            }
        }

        return await Entry.find({ _id: { $in: entryIds } });
    }

    static async create(variant: QuestVariant, poolId: string, data: Partial<TQuest>, file?: Express.Multer.File) {
        if (file) {
            data.image = await ImageService.upload(file);
        }

        const Quest = serviceMap[variant].models.quest;
        const quest = await Quest.create({ ...data, poolId, variant, uuid: v4() });

        if (data.isPublished) {
            await NotificationService.notify(variant, quest);
        }

        return quest;
    }

    static findById(variant: QuestVariant, questId: string) {
        const Quest = serviceMap[variant].models.quest;
        return Quest.findById(questId);
    }

    static updateById(variant: QuestVariant, questId: string, options: Partial<TQuest>) {
        const Quest = serviceMap[variant].models.quest;
        return Quest.findByIdAndUpdate(questId, options, { new: true });
    }

    static getAmount(variant: QuestVariant, quest: TQuest, account: TAccount, data?: { metadata: any }) {
        return serviceMap[variant].getAmount({ quest, account, data });
    }

    static async getEntriesPendingReview(quest: TQuest, account?: TAccount) {
        if (!quest.isReviewEnabled || !account) return [];

        const Entry = serviceMap[quest.variant].models.entry;
        return await Entry.find({ questId: quest._id, sub: account.sub, status: QuestEntryStatus.Pending });
    }

    static isExpired(quest: TQuest) {
        return quest.expiryDate ? new Date(quest.expiryDate).getTime() < Date.now() : false;
    }

    static async isAvailable(
        variant: QuestVariant,
        options: {
            quest: TQuest;
            account?: TAccount;
            data: Partial<TQuestEntry & { rpc: string }>;
        },
    ): Promise<TValidationResult> {
        if (!options.quest.isPublished) {
            return { result: false, reason: 'Quest has not been published.' };
        }

        const isExpired = this.isExpired(options.quest);
        if (isExpired) return { result: false, reason: 'Quest has expired.' };

        const isLocked = await LockService.getIsLocked(options.quest.locks, options.account);
        if (isLocked) return { result: false, reason: 'Quest is locked.' };

        return await serviceMap[variant].isAvailable(options);
    }

    static async isRealUser(
        variant: QuestVariant,
        options: { quest: TQuest; account: TAccount; data: Partial<TQuestEntry & { recaptcha: string }> },
    ) {
        // Skip recaptcha check non production environments
        if (NODE_ENV !== 'production') return { result: true, reasons: '' };

        // Define the recaptcha action for this quest variant
        const recaptchaAction = `QUEST_${QuestVariant[variant].toUpperCase()}_ENTRY_CREATE`;

        // Update the participant's risk score
        const { riskAnalysis } = await ParticipantService.updateRiskScore(options.account, options.quest.poolId, {
            token: options.data.recaptcha,
            recaptchaAction,
        });

        // Defaults: 0.1, 0.3, 0.7 and 0.9. Ranges from 0 (Bot) to 1 (User)
        if (riskAnalysis.score >= 0.7) {
            return { result: true, reason: '' };
        }

        return { result: false, reason: 'This request has been indentified as potentially automated.' };
    }

    static async isIPCoolDown(
        variant: QuestVariant,
        options: { quest: TQuest; account: TAccount; data: Partial<TQuestEntry> },
    ) {
        if (options.quest.isIPLimitEnabled) {
            const ONE_DAY_MS = 86400 * 1000; // 24 hours in milliseconds
            const now = Date.now(),
                start = now - ONE_DAY_MS,
                end = now;
            const Entry = serviceMap[variant].models.entry;
            const isCompletedForIP = !!(await Entry.exists({
                questId: options.quest._id,
                createdAt: { $gt: new Date(start), $lt: new Date(end) },
                ip: options.data.ip,
            }));
            if (isCompletedForIP) {
                return {
                    result: false,
                    reason: 'You have completed this quest from this IP within the last 24 hours.',
                };
            }
        }

        return { result: true, reason: '' };
    }

    static async getValidationResult(
        variant: QuestVariant,
        options: {
            quest: TQuest;
            account: TAccount;
            data: Partial<TQuestEntry>;
        },
    ) {
        // Test for risk score (@dev does not work with discord calls)
        const isRealUser = await QuestService.isRealUser(variant, options);
        if (!isRealUser.result) return isRealUser;

        // Test for IP as we limit to 1 per IP per day (if an ip is passed)
        const isIPCoolDown = await this.isIPCoolDown(variant, options);
        if (!isIPCoolDown.result) return isIPCoolDown;

        // Test for availability of the quest
        const isAvailable = await this.isAvailable(variant, options);
        if (!isAvailable.result) return isAvailable;

        return await serviceMap[variant].getValidationResult(options);
    }

    static async getEntryMetadata({ account, quest, data }) {
        const platformUserId = QuestSocialService.findUserIdForInteraction(account, quest.interaction);

        // For Discord Bot quests we store server user name in metadata
        if (quest.variant === QuestVariant.Discord && quest.interaction !== QuestSocialRequirement.DiscordGuildJoined) {
            const guild = await DiscordService.getGuild(quest.poolId);
            const member = guild && (await DiscordService.getMember(guild.id, platformUserId));

            return {
                ...data,
                platformUserId,
                metadata: {
                    discord: {
                        guildId: guild && guild.id,
                        username: member.user.username,
                        joinedAt: new Date(member.joinedTimestamp).toISOString(),
                        reactionCount: guild
                            ? await DiscordReaction.countDocuments({ guildId: guild.id, userId: platformUserId })
                            : 0,
                        messageCount: guild
                            ? await DiscordMessage.countDocuments({ guildId: guild.id, userId: platformUserId })
                            : 0,
                    },
                },
            };
        }

        // For Twitter quests we store public metrics in metadata
        if (quest.variant === QuestVariant.Twitter) {
            const user = await TwitterUser.findOne({ userId: platformUserId });
            return {
                ...data,
                platformUserId,
                metadata: {
                    twitter: user.publicMetrics,
                },
            };
        }

        return data;
    }

    static async createEntryJob(job: Job) {
        try {
            const { variant, questId, sub, data } = job.attrs.data as any;
            const Entry = serviceMap[Number(variant)].models.entry;
            const account = await AccountProxy.findById(sub);
            const quest = await this.findById(variant, questId);
            const pool = await PoolService.getById(quest.poolId);
            const amount = await this.getAmount(variant, quest, account, data);

            // Test availabily of quest once more as it could be completed by a job that was scheduled already
            // if the jobs were created in parallel.
            const isAvailable = await this.isAvailable(variant, { quest, account, data });
            if (!isAvailable.result) throw new Error(isAvailable.reason);

            // Create the quest entry
            const status = quest.isReviewEnabled ? QuestEntryStatus.Pending : QuestEntryStatus.Approved;
            const metadata = await this.getEntryMetadata({ quest, account, data });
            const entry = await Entry.create({
                ...metadata,
                amount,
                sub: account.sub,
                questId: quest.id,
                poolId: pool.id,
                status,
                uuid: v4(),
            } as TQuestEntry);
            if (!entry) throw new Error('Entry creation failed.');

            // Assert if a required quest for invite quests has been completed
            const InviteService = serviceMap[QuestVariant.Invite] as IQuestInviteService;
            await InviteService.assertQuestEntry({ pool, quest, account });

            // Add points to participant balance if manual review is disabled
            if (!quest.isReviewEnabled) {
                await PointBalanceService.add(pool, account, amount);
            }

            // Update participant ranks async
            await agenda.now(JobType.UpdateParticipantRanks, { poolId: pool.id });

            // Update leaderboard async
            await agenda.now(JobType.UpdateLeaderboard, { poolId: pool.id });

            // Send Discord and e-mail notifications
            await NotificationService.sendQuestEntryNotification(pool, quest, account, amount);

            // Register THX onboarding campaign event for completed daily quests
            if (quest.variant === QuestVariant.Daily) {
                await THXService.createEvent(account, 'quest_entry_created');
            }
        } catch (error) {
            logger.error(error);
        }
    }

    // static findUserIdForInteraction(account: TAccount, interaction: QuestSocialRequirement) {
    //     if (typeof interaction === 'undefined') return;
    //     const { kind } = tokenInteractionMap[interaction];
    //     const token = account.tokens.find((token) => token.kind === kind);

    //     return token && token.userId;
    // }

    static async findEntries(quest: TQuest, { page = 1, limit = 25 }: { page: number; limit: number }) {
        const skip = (page - 1) * limit;
        const Entry = serviceMap[quest.variant].models.entry;
        const total = await Entry.countDocuments({ questId: quest._id });
        const entries = await Entry.find({ questId: quest._id }).limit(limit).skip(skip);
        const subs = entries.map((entry) => entry.sub);
        const accounts = await AccountProxy.find({ subs });
        const participants = await Participant.find({ poolId: quest.poolId });
        const results = await PromiseParser.parse(
            entries.map(async (entry) => ParticipantService.decorate(entry, { accounts, participants })),
        );
        const meta = await serviceMap[quest.variant].findEntryMetadata({ quest });

        return {
            total,
            limit,
            page,
            meta,
            results,
        };
    }
}
