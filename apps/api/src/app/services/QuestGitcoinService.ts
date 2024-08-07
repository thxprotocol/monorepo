import { Request } from 'express';
import { QuestGitcoin, QuestGitcoinEntry } from '@thxnetwork/api/models';
import { IQuestService } from './interfaces/IQuestService';
import GitcoinService from './GitcoinService';
import NetworkService from './NetworkService';

export default class QuestGitcoinService implements IQuestService {
    models = {
        quest: QuestGitcoin,
        entry: QuestGitcoinEntry,
    };

    async getDataForRequest(req: Request, options: { quest: TQuest; account: TAccount }) {
        const address = NetworkService.recoverSigner(req.body.message, req.body.signature);
        return { metadata: { address } };
    }

    findEntryMetadata(options: { quest: TQuestGitcoin }) {
        return {};
    }

    async decorate({
        quest,
        account,
        data,
    }: {
        quest: TQuestGitcoin;
        account?: TAccount;
        data: Partial<TQuestGitcoinEntry>;
    }): Promise<TQuestGitcoin & { isAvailable: boolean }> {
        const isAvailable = await this.isAvailable({ quest, account, data });
        return { ...quest, isAvailable: isAvailable.result };
    }

    async isAvailable({
        quest,
        account,
        data,
    }: {
        quest: TQuestGitcoin;
        account?: TAccount;
        data: Partial<TQuestGitcoinEntry>;
    }): Promise<TValidationResult> {
        if (!account) return { result: true, reason: '' };

        const ids: { [key: string]: string }[] = [{ sub: account.sub }];
        if (data.metadata && data.metadata.address) ids.push({ 'metadata.address': data.metadata.address });

        const isCompleted = await QuestGitcoinEntry.exists({
            questId: quest._id,
            $or: ids,
        });
        if (!isCompleted) return { result: true, reason: '' };

        return { result: false, reason: 'You have completed this quest with this account and/or address already.' };
    }

    async getAmount({ quest }: { quest: TQuestGitcoin; account: TAccount }): Promise<number> {
        return quest.amount;
    }

    async getValidationResult({
        quest,
        data,
    }: {
        quest: TQuestGitcoin;
        account: TAccount;
        data: Partial<TQuestGitcoinEntry>;
    }): Promise<TValidationResult & { score?: number }> {
        if (!data.metadata.address) return { result: false, reason: 'Could not find an address during validation.' };
        if (data.metadata.score < quest.score) {
            const score = data.metadata.score.toString() || 0;
            const reason = `Your score ${score}/100 does not meet the minimum of ${quest.score}/100.`;
            return { result: false, reason };
        }
        if (data.metadata.score >= quest.score) return { result: true, reason: '', score: data.metadata.score };
    }

    async getScore(scorerId: number, address: string) {
        return await GitcoinService.getScoreUniqueHumanity(scorerId, address);
    }
}
