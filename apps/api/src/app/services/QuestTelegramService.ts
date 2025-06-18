import { QuestSocialEntry, QuestSocial } from '@thxnetwork/api/models';
import { IQuestService } from './interfaces/IQuestService';
import { requirementMap } from './maps/quests';
import QuestSocialService from './QuestSocialService';
import { Request } from 'express';

export default class QuestTelegramService implements IQuestService {
    models = {
        quest: QuestSocial,
        entry: QuestSocialEntry,
    };

    async getDataForRequest(req: Request, options: { quest: TQuestSocial; account: TAccount }) {
        return {};
    }

    async findEntryMetadata({ quest }: { quest: TQuestSocial }): Promise<TQuestSocialEntry> {
        return quest.contentMetadata && JSON.parse(quest.contentMetadata);
    }

    async decorate({
        quest,
        account,
    }: {
        quest: TQuestSocial;
        account: TAccount;
        data: Partial<TQuestSocialEntry>;
    }): Promise<TQuestSocial & { isAvailable: boolean }> {
        const isAvailable = await this.isAvailable({ quest, account });

        return {
            ...quest,
            isAvailable: isAvailable.result,
            contentMetadata: quest.contentMetadata && JSON.parse(quest.contentMetadata),
        };
    }

    async isAvailable({ quest, account }: { quest: TQuestSocial; account?: TAccount }): Promise<TValidationResult> {
        if (!account) return { result: true, reason: '' };

        // Use the default QuestSocialService for availability check
        return await new QuestSocialService().isAvailable({ quest, account });
    }

    async getAmount({ quest }: { quest: TQuestSocial; account?: TAccount }): Promise<number> {
        return quest.amount;
    }

    async getValidationResult(options: {
        quest: TQuestSocial;
        account: TAccount;
        data: Partial<TQuestSocialEntry>;
    }): Promise<TValidationResult> {
        if (!options.quest.interaction) return { result: false, reason: '' };
        return await requirementMap[options.quest.interaction](options.account, options.quest);
    }
}
