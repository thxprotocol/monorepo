import { QuestWebhook, QuestWebhookDocument, QuestWebhookEntry, WalletDocument, Webhook } from '@thxnetwork/api/models';
import { IQuestService } from './interfaces/IQuestService';
import WebhookService from './WebhookService';
import { Request } from 'express';

export default class QuestWebhookService implements IQuestService {
    models = {
        quest: QuestWebhook,
        entry: QuestWebhookEntry,
    };

    async getDataForRequest(req: Request, options: { quest: TQuest; account: TAccount }) {
        return {};
    }

    async findEntryMetadata({ quest }: { quest: QuestWebhookDocument }) {
        const uniqueParticipantIds = await QuestWebhookEntry.countDocuments({
            questId: String(quest._id),
        }).distinct('sub');

        return { participantCount: uniqueParticipantIds.length };
    }

    async isAvailable({
        quest,
        account,
    }: {
        quest: QuestWebhookDocument;
        wallet?: WalletDocument;
        account?: TAccount;
        data: Partial<TQuestWebhookEntry>;
    }): Promise<TValidationResult> {
        const entries = await this.findAllEntries({ quest, account });
        if (!entries.length) {
            return { result: true, reason: '' };
        } else {
            return { result: false, reason: 'Quest entry limit has been reached.' };
        }
    }

    async getAmount({
        quest,
        data,
    }: {
        quest: QuestWebhookDocument;
        wallet: WalletDocument;
        account: TAccount;
        data?: { metadata: { result: boolean; data: { amount: number } } };
    }) {
        return quest.isAmountCustom ? data.metadata.data.amount : quest.amount;
    }

    async decorate({
        quest,
        account,
        data,
    }: {
        quest: QuestWebhookDocument;
        account?: TAccount;
        data: Partial<TQuestWebhookEntry>;
    }) {
        const entries = await this.findAllEntries({ quest, account });
        const isAvailable = await this.isAvailable({ quest, account, data });

        return {
            ...quest,
            isAvailable: isAvailable.result,
            entries,
        };
    }

    async getValidationResult({
        quest,
        account,
    }: {
        quest: QuestWebhookDocument;
        account: TAccount;
        data: Partial<TQuestWebhookEntry>;
    }): Promise<{ reason: string; result: boolean; data?: { result: boolean; amount?: number } }> {
        const webhook = await Webhook.findById(quest.webhookId);
        if (!webhook) return { result: false, reason: 'Webhook no longer available.' };

        const data = await WebhookService.request(webhook, account, quest.metadata);
        if (!data) return { result: false, reason: 'Webhook validation returned nothing.' };
        if (!data.result) return { result: false, reason: 'Webhook validation was negative.' };
        if (data.result) {
            return {
                result: true,
                reason: '',
                data,
            };
        }

        return { result: false, reason: 'Webhook validation request failed.' };
    }

    private async findAllEntries({ quest, account }: { quest: QuestWebhookDocument; account: TAccount }) {
        if (!account) return [];
        return await this.models.entry.find({
            questId: quest._id,
            sub: account.sub,
        });
    }
}
