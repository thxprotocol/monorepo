import { Participant, PoolDocument, QuestInvite, QuestInviteDocument, QuestInviteEntry } from '@thxnetwork/api/models';
import { IQuestService } from './interfaces/IQuestService';
import { QuestInviteCode, QuestInviteCodeDocument } from '../models/QuestInviteCode';
import { serviceMap } from './interfaces/IQuestService';
import PointBalanceService from './PointBalanceService';
import AccountProxy from '../proxies/AccountProxy';

export default class QuestInviteService implements IQuestService {
    models = {
        quest: QuestInvite,
        entry: QuestInviteEntry,
    };

    findEntryMetadata(options: { quest: TQuestInvite }) {
        return {};
    }

    async decorate({
        quest,
        account,
        data,
    }: {
        quest: TQuestInvite;
        account?: TAccount;
        data: Partial<TQuestInviteEntry>;
    }): Promise<TQuestInvite & { isAvailable: boolean; codes: QuestInviteCodeDocument[]; invitees: TInvitee[] }> {
        const invitees = await this.getInvitees({ quest, account });
        const codes = await this.getCodes({ quest, account });
        const { result: isAvailable } = await this.isAvailable({ quest, account, data });

        return {
            ...quest,
            codes,
            invitees,
            isAvailable,
        };
    }

    async isAvailable(options: {
        quest: TQuestInvite;
        account?: TAccount;
        data: Partial<TQuestInviteEntry>;
    }): Promise<TValidationResult> {
        return { result: true, reason: '' };
    }

    async getAmount({ quest }: { quest: TQuestInvite; account: TAccount }): Promise<number> {
        return quest.amount;
    }

    async getValidationResult(options: {
        quest: TQuestInvite;
        account: TAccount;
        data: Partial<TQuestInviteEntry>;
    }): Promise<TValidationResult> {
        return { result: true, reason: '' };
    }

    /**
     * Asserts if the quest entry should trigger points transfers for potentially
     * available QuestInvite quests.
     * @param options.pool
     * @param options.quest
     * @param options.entry
     * @param options.account
     */
    async assertQuestEntry({
        pool,
        quest,
        entry,
        account,
    }: {
        pool: PoolDocument;
        quest: TQuest;
        entry: TQuestEntry;
        account: TAccount;
    }) {
        // Return early if participant has not been invited
        const participant = await Participant.findOne({ poolId: quest.poolId, sub: account.sub });
        if (!participant.invitedBySub) return;

        // Return early if no QuestInvite for this poolId
        const inviteQuests = await QuestInvite.find({ poolId: entry.poolId });
        if (!inviteQuests.length) return;

        // Iterate over invite quests and assert if all quests for this invite quests have been completed
        for (const inviteQuest of inviteQuests) {
            const Entry = serviceMap[inviteQuest.requiredQuest.variant].models.entry;
            const questEntry = await Entry.findOne({ questId: inviteQuest.requiredQuest.questId, sub: account.sub });
            if (!questEntry) continue;

            // Transfer points to inviter
            const inviter = await AccountProxy.findById(participant.invitedBySub);
            if (!inviter) throw new Error('Inviter not found');

            // Update entry for invites
            // Update entry for invitee

            // Transfer points to invitee
            await PointBalanceService.add(pool, inviter, inviteQuest.amount);
            await PointBalanceService.add(pool, account, inviteQuest.amountInvitee);
        }
    }

    async createCode({ quest, account }: { quest: TQuestInvite; account: TAccount }) {
        // Generate a random 10 character code only containing letters and no numbers
        const code = Math.random()
            .toString(36)
            .replace(/[^a-z]+/g, '')
            .substr(0, 10)
            .toUpperCase();

        // Upsert the code
        return await QuestInviteCode.create({
            questId: String(quest._id),
            sub: account.sub,
            code,
        });
    }

    private async getCodes({ quest, account }: { quest: TQuestInvite; account?: TAccount }) {
        if (!account) return [];
        const codes = await QuestInviteCode.find({ questId: String(quest._id), sub: account.sub });
        if (codes.length) return codes;
        const code = await this.createCode({ quest, account });
        return [code];
    }

    private async getInvitees({ quest, account }: { quest: TQuestInvite; account?: TAccount }) {
        if (!account) return [];

        const participants = await Participant.find({ poolId: quest.poolId, invitedBySub: account.sub });
        const subs = participants.map((participant) => participant.sub);
        const accounts = await AccountProxy.find({ subs });

        return accounts.map((account) => {
            const participant = participants.find((participant) => participant.sub === account.sub);
            return { username: account.username, createdAt: participant.createdAt };
        });
    }
}
