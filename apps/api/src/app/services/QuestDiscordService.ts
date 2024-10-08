import { QuestSocialEntry, QuestSocial, DiscordMessage } from '@thxnetwork/api/models';
import { QuestSocialRequirement } from '@thxnetwork/common/enums';
import { IQuestService } from './interfaces/IQuestService';
import { requirementMap } from './maps/quests';
import QuestSocialService from './QuestSocialService';
import { Request } from 'express';

type TRestartDates = { now: Date; start: Date; endDay: Date; end: Date };

export default class QuestDiscordService implements IQuestService {
    models = {
        quest: QuestSocial,
        entry: QuestSocialEntry,
    };

    async getDataForRequest(req: Request, options: { quest: TQuestSocial; account: TAccount }) {
        return {};
    }

    findEntryMetadata(options: { quest: TQuestSocial }) {
        return {};
    }

    async decorate({
        quest,
        account,
    }: {
        quest: TQuestSocial;
        account: TAccount;
        data: Partial<TQuestSocialEntry>;
    }): Promise<
        TQuestSocial & {
            messages: TDiscordMessage[];
            restartDates: TRestartDates;
            amount: number;
            isAvailable: boolean;
        }
    > {
        const amount = await this.getAmount({ quest, account });
        const isAvailable = await this.isAvailable({ quest, account });
        const interactionMap = {
            [QuestSocialRequirement.DiscordMessage]: this.getDiscordMessageParams.bind(this),
            [QuestSocialRequirement.DiscordGuildJoined]: this.getDiscordParams.bind(this),
            [QuestSocialRequirement.DiscordGuildRole]: this.getDiscordParams.bind(this),
        };
        const extraParams = await interactionMap[quest.interaction]({ quest, account });

        return {
            ...quest,
            amount,
            isAvailable: isAvailable.result,
            contentMetadata: quest.contentMetadata && JSON.parse(quest.contentMetadata),
            ...extraParams,
        };
    }

    async isAvailable({ quest, account }: { quest: TQuestSocial; account?: TAccount }): Promise<TValidationResult> {
        const map = {
            [QuestSocialRequirement.DiscordMessage]: this.isAvailableMessage.bind(this),
            [QuestSocialRequirement.DiscordGuildJoined]: this.isAvailableDefault.bind(this),
            [QuestSocialRequirement.DiscordGuildRole]: this.isAvailableDefault.bind(this),
        };
        return await map[quest.interaction]({ quest, account });
    }

    private async isAvailableDefault({
        quest,
        account,
    }: {
        quest: TQuestSocial;
        account?: TAccount;
        data: Partial<TQuestSocialEntry>;
    }) {
        if (!account) return { result: true, reason: '' };

        // We use the default more generic QuestSocialService here since we want to
        // validate for platformUserIds as well
        return await new QuestSocialService().isAvailable({ quest, account });
    }

    private async isAvailableMessage({ quest, account }: { quest: TQuestSocial; account?: TAccount }) {
        const { pointsAvailable } = await this.getMessagePoints({ quest, account });
        const isAvailable = pointsAvailable > 0;
        if (isAvailable) return { result: true, reason: '' };

        return { result: false, reason: 'You have not earned any points with messages yet.' };
    }

    async getAmount({ account, quest }: { quest: TQuestSocial; account?: TAccount }): Promise<number> {
        const interactionMap = {
            [QuestSocialRequirement.DiscordMessage]: this.getMessagePoints.bind(this),
            [QuestSocialRequirement.DiscordGuildJoined]: this.getPoints.bind(this),
            [QuestSocialRequirement.DiscordGuildRole]: this.getPoints.bind(this),
        };
        const { pointsAvailable } = await interactionMap[quest.interaction]({ quest, account });
        return pointsAvailable;
    }

    async getValidationResult(options: {
        quest: TQuestSocial;
        account: TAccount;
        data: Partial<TQuestSocialEntry>;
    }): Promise<TValidationResult> {
        if (!options.quest.interaction) return { result: false, reason: '' };
        return await requirementMap[options.quest.interaction](options.account, options.quest);
    }

    private getRestartDates(quest: TQuestSocial) {
        const { days } = JSON.parse(quest.contentMetadata);
        const now = new Date();
        const questCreatedAt = new Date(quest.createdAt);
        const totalDaysRunning = Math.floor(
            Math.ceil(now.getTime() / 1000 - questCreatedAt.getTime() / 1000) / 60 / 60 / 24,
        );
        const daysRunning = totalDaysRunning % days;
        const msRunning = daysRunning * 24 * 60 * 60 * 1000;

        const start = new Date(now.getTime() - msRunning);
        start.setUTCHours(0, 0, 0, 0);

        const end = new Date(start.getTime() + days * 24 * 60 * 60 * 1000);
        const endDay = new Date(now);
        endDay.setUTCHours(23, 59, 59, 999);

        return { now, start, endDay, end };
    }

    private async getDiscordParams({ quest }: { quest: TQuestSocial; account: TAccount }) {
        return { pointsAvailable: quest.amount };
    }

    private async getDiscordMessageParams({ quest, account }: { quest: TQuestSocial; account: TAccount }) {
        const restartDates = this.getRestartDates(quest);
        const messages = await this.getMessages({ account, quest, start: restartDates.start });
        const points = await this.getMessagePoints({
            quest,
            account,
        });

        return {
            restartDates,
            messages,
            ...points,
        };
    }

    private async getMessages({ quest, account, start }: { quest: TQuestSocial; account: TAccount; start: Date }) {
        if (!account) return [];

        const userId = QuestSocialService.findUserIdForInteraction(account, quest.interaction);
        return await DiscordMessage.find({
            guildId: quest.content,
            memberId: userId,
            createdAt: { $gte: new Date(start).toISOString() },
        });
    }

    private async getPoints({ quest }) {
        return { pointsAvailable: quest.amount };
    }

    private async getMessagePoints({ quest, account }) {
        if (!account) return { pointsAvailable: 0, pointsClaimed: 0 };

        const { start, end } = this.getRestartDates(quest);
        const platformUserId = QuestSocialService.findUserIdForInteraction(account, quest.interaction);
        const entries = await QuestSocialEntry.find({
            'questId': quest.id,
            'metadata.platformUserId': platformUserId,
            'createdAt': {
                $gte: start,
                $lt: end,
            },
        }).sort({ createdAt: -1 });
        const [entry] = entries;
        const pointsClaimed = entries.reduce((total, entry) => total + Number(entry.amount), 0);

        // Only find messages created after the last claim if one exists
        const messages = await DiscordMessage.find({
            guildId: quest.content,
            memberId: platformUserId,
            createdAt: { $gte: entry ? entry.createdAt : start, $lt: end },
        });
        const pointsAvailable = messages.length * quest.amount;

        return { pointsClaimed, pointsAvailable };
    }
}
