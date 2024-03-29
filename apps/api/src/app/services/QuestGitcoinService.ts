import axios from 'axios';
import { GITCOIN_API_KEY } from '../config/secrets';
import { logger } from '../util/logger';
import { QuestGitcoin, QuestGitcoinEntry } from '@thxnetwork/api/models';
import { IQuestService } from './interfaces/IQuestService';
import GitcoinService from './GitcoinService';

export default class QuestGitcoinService implements IQuestService {
    models = {
        quest: QuestGitcoin,
        entry: QuestGitcoinEntry,
    };

    findEntryMetadata(options: { quest: TGitcoinQuest }) {
        return {};
    }

    async decorate({
        quest,
        account,
        data,
    }: {
        quest: TGitcoinQuest;
        account?: TAccount;
        data: Partial<TGitcoinQuestEntry>;
    }): Promise<TGitcoinQuest & { isAvailable: boolean }> {
        const isAvailable = await this.isAvailable({ quest, account, data });
        return { ...quest, isAvailable: isAvailable.result };
    }

    async isAvailable({
        quest,
        account,
        data,
    }: {
        quest: TGitcoinQuest;
        account?: TAccount;
        data: Partial<TGitcoinQuestEntry>;
    }): Promise<TValidationResult> {
        if (!account) return { result: true, reason: '' };

        const ids: { [key: string]: string }[] = [{ sub: account.sub }];
        if (data && data.address) ids.push({ address: data.address });

        const isCompleted = await QuestGitcoinEntry.exists({
            questId: quest._id,
            $or: ids,
        });
        if (!isCompleted) return { result: true, reason: '' };

        return { result: false, reason: 'You have completed this quest with this account and/or address already.' };
    }

    async getAmount({ quest }: { quest: TGitcoinQuest; account: TAccount }): Promise<number> {
        return quest.amount;
    }

    async getValidationResult({
        quest,
        data,
    }: {
        quest: TGitcoinQuest;
        account: TAccount;
        data: Partial<TGitcoinQuestEntry>;
    }): Promise<TValidationResult> {
        if (!data.address) return { result: false, reason: 'Could not find an address during validation.' };

        const { score, error } = await GitcoinService.getScoreUniqueHumanity(
            quest.scorerId,
            data.address.toLowerCase(),
        );
        if (error) return { result: false, reason: error };
        if (score < quest.score) {
            return {
                result: false,
                reason: `Your score ${score.toString() || 0}/100 does not meet the minimum of ${quest.score}/100.`,
            };
        }
        if (score >= quest.score) return { result: true, reason: '' };
    }

    async getScore(scorerId: number, address: string) {
        try {
            const response = await axios({
                url: `https://api.scorer.gitcoin.co/registry/score/${scorerId}/${address}`,
                headers: { 'X-API-KEY': GITCOIN_API_KEY },
            });
            return { score: response.data.score };
        } catch (error) {
            logger.error(error.message);
            return { error: `Could not get a score for ${address}.` };
        }
    }
}
