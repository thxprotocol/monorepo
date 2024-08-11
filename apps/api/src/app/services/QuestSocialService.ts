import { QuestSocial, QuestSocialDocument, QuestSocialEntry } from '@thxnetwork/api/models';
import { WalletDocument } from '@thxnetwork/api/models/Wallet';
import { IQuestService } from './interfaces/IQuestService';
import { requirementMap, tokenInteractionMap } from './maps/quests';
import { logger } from '../util/logger';
import { QuestSocialRequirement, QuestVariant } from '@thxnetwork/common/enums';
import { Request } from 'express';

export default class QuestSocialService implements IQuestService {
    models = {
        quest: QuestSocial,
        entry: QuestSocialEntry,
    };

    async getDataForRequest(
        req: Request,
        { quest, account }: { quest: TQuestSocial; account: TAccount },
    ): Promise<Partial<TQuestEntry>> {
        const platformUserId = QuestSocialService.findUserIdForInteraction(account, quest.interaction);
        return { metadata: { platformUserId } };
    }

    async decorate({
        quest,
        account,
        data,
    }: {
        quest: TQuestSocial;
        account?: TAccount;
        data: Partial<TQuestSocialEntry>;
    }): Promise<TQuestSocial & { isAvailable: boolean }> {
        const isAvailable = await this.isAvailable({ quest, account, data });

        return {
            ...quest,
            isAvailable: isAvailable.result,
            contentMetadata: quest.contentMetadata && JSON.parse(quest.contentMetadata),
        };
    }

    async isAvailable({
        quest,
        account,
    }: {
        quest: TQuestSocial;
        account: TAccount;
        data: Partial<TQuestSocialEntry>;
    }): Promise<TValidationResult> {
        if (!account) return { result: true, reason: '' };

        const platformUserId = QuestSocialService.findUserIdForInteraction(account, quest.interaction);
        // We validate for both here since there are entries that only contain a sub
        // and should not be claimed again.
        const conditions: any[] = [{ sub: account.sub }];
        if (platformUserId) conditions.push({ 'metadata.platformUserId': platformUserId });

        // If no entry exist the quest is available
        const isCompleted = await QuestSocialEntry.exists({
            questId: quest._id,
            $or: conditions,
        });
        if (!isCompleted) return { result: true, reason: '' };

        return { result: false, reason: 'You have completed this quest with this (connected) account already.' };
    }

    async getAmount({ quest }: { quest: TQuestSocial; wallet: WalletDocument; account: TAccount }): Promise<number> {
        return quest.amount;
    }

    async getValidationResult({
        quest,
        account,
    }: {
        quest: TQuestSocial;
        account: TAccount;
        data: Partial<TQuestSocialEntry>;
    }): Promise<TValidationResult> {
        try {
            // Check quest requirements
            const validationResult = await requirementMap[quest.interaction](account, quest);
            return validationResult || { result: true, reason: '' };
        } catch (error) {
            logger.error(error);
            return { result: false, reason: 'We were unable to confirm the requirements for this quest.' };
        }
    }

    async findEntryMetadata({ quest }: { quest: QuestSocialDocument }) {
        const reachTotal = await this.getTwitterFollowerCount(quest);
        const uniqueParticipantIds = await QuestSocialEntry.find({
            questId: quest.id,
        }).distinct('sub');

        return { reachTotal, participantCount: uniqueParticipantIds.length };
    }

    async getTwitterFollowerCount(quest: QuestSocialDocument) {
        if (quest.variant !== QuestVariant.Twitter) return;

        const [result] = await QuestSocialEntry.aggregate([
            { $match: { questId: String(quest._id) } },
            { $group: { _id: null, totalFollowersCount: { $sum: '$publicMetrics.followersCount' } } },
        ]);

        return result ? result.totalFollowersCount : 0;
    }

    static findUserIdForInteraction(account: TAccount, interaction: QuestSocialRequirement) {
        if (typeof interaction === 'undefined') return;
        const { kind } = tokenInteractionMap[interaction];
        const token = account.tokens.find((token) => token.kind === kind);
        return token && token.userId;
    }
}
