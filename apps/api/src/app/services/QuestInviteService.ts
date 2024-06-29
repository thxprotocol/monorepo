import { Participant, PoolDocument, QuestInvite, QuestInviteEntry } from '@thxnetwork/api/models';
import { IQuestService } from './interfaces/IQuestService';
import { QuestInviteCode, QuestInviteCodeDocument } from '../models/QuestInviteCode';
import { serviceMap } from './interfaces/IQuestService';
import { logger } from '../util/logger';
import { WIDGET_URL } from '../config/secrets';
import PointBalanceService from './PointBalanceService';
import AccountProxy from '../proxies/AccountProxy';
import MailService from './MailService';

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
    }): Promise<
        TQuestInvite & { isAvailable: boolean; uses: number; codes: QuestInviteCodeDocument[]; invitees: TInvitee[] }
    > {
        const { result: isAvailable } = await this.isAvailable({ quest, account, data });
        const invitees = await this.getInvitees({ quest, account });
        const codes = await this.getCodes({ quest, account });
        const uses = await this.getUses({ quest, account });
        const amount = await this.getAmount({ quest, account });

        return {
            ...quest,
            amount,
            uses,
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

    /**
     * The amount of points is determined by the amount of entries found for the invite
     * codes owned by the account.
     * @param options.quest
     * @param options.account
     */
    async getAmount({ quest, account }: { quest: TQuestInvite; account: TAccount }): Promise<number> {
        // Return early if no account or no invitee entries
        const entriesInvitee = await this.getInviteeEntries({ quest, account });
        if (!account || !entriesInvitee.length) return 0;

        // Calculate the diff between the total available and the amount already claimed
        const total = entriesInvitee.length * quest.amount;
        const entries = await this.getEntries({ quest, account });
        const totalEntries = entries.reduce((acc, entry) => acc + Number(entry.amount), 0);

        return total - totalEntries;
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
    async assertQuestEntry({ pool, quest, account }: { pool: PoolDocument; quest: TQuest; account: TAccount }) {
        // Return early if no QuestInvite for this poolId
        const inviteQuests = await QuestInvite.find({ poolId: quest.poolId });
        if (!inviteQuests.length) return;

        // Return early if participant has not been invited
        const participant = await Participant.findOne({ poolId: quest.poolId, sub: account.sub });
        if (!participant.inviteCode) return;

        // Transfer points to inviter
        const code = await QuestInviteCode.findOne({ code: participant.inviteCode });
        if (!code) {
            logger.error('Invite code not found');
            return;
        }

        // Iterate over invite quests and assert if all quests for this invite quest have been completed
        for (const inviteQuest of inviteQuests) {
            // Search for a single required quest entry by another user and continue if it does not exist
            const Entry = serviceMap[inviteQuest.requiredQuest.variant].models.entry;
            const requiredQuestEntry = await Entry.findOne({
                questId: inviteQuest.requiredQuest.questId,
                sub: account.sub,
            });
            if (!requiredQuestEntry) continue;

            // If the participant has received the invite quest bonus already continue
            const inviteQuestEntry = await QuestInviteEntry.findOne({
                'sub': account.sub,
                'questId': inviteQuest.id,
                'metadata.code': code.code,
            });
            if (inviteQuestEntry) continue;

            // If the inviter had no account or equals invitee  continue
            const inviter = await AccountProxy.findById(code.sub);
            if (!inviter || inviter.sub === account.sub) continue;

            // Send notification to inviter
            await MailService.send(
                inviter.email,
                '🔗 Your Invite Link was used!',
                `<p>Hi!</p>
                <p>Your invite link was used and <strong>${account.username}</strong> has completed the invite quest requirements.</p>
                <p>
                <strong>${account.username}</strong> earned <strong>${inviteQuest.amountInvitee}</strong> bonus points.<br />
                You earned <strong>${inviteQuest.amount} points</strong>!
                </p>`,
                { src: WIDGET_URL + `/c/${pool.settings.slug}`, text: 'View Campaign' },
            );

            // Create entry for invitee
            await QuestInviteEntry.create({
                questId: inviteQuest.id,
                sub: account.sub,
                amount: inviteQuest.amountInvitee,
                metadata: {
                    code: code.code,
                    inviter: inviter.username,
                },
            });

            // Transfer points to invitee
            await PointBalanceService.add(pool, account, inviteQuest.amountInvitee);
        }
    }

    // Generate a random 10 character code only containing letters and no numbers
    async createCode({ quest, account }: { quest: TQuestInvite; account: TAccount }) {
        const generateCode = () =>
            Math.random()
                .toString(36)
                .replace(/[^a-z]+/g, '')
                .substr(0, 10)
                .toUpperCase();

        // Test for dups
        let code = generateCode();
        let isCodeUnique = true;
        while (isCodeUnique) {
            isCodeUnique = !(await QuestInviteCode.exists({ code }));
            if (isCodeUnique) break;
            code = generateCode();
        }

        // Upsert the code
        return await QuestInviteCode.create({
            questId: String(quest._id),
            sub: account.sub,
            code,
        });
    }

    private async getEntries({ quest, account }: { quest: TQuestInvite; account: TAccount }) {
        return await QuestInviteEntry.find({
            sub: account.sub,
            questId: String(quest._id),
            inviteCodeId: { $exists: false },
        });
    }

    // Get all entries created through a code owned by the account
    private async getInviteeEntries({ quest, account }: { quest: TQuestInvite; account: TAccount }) {
        const codes = await this.getCodes({ quest, account });
        return await QuestInviteEntry.find({
            'questId': String(quest._id),
            'metadata.code': { $in: codes.map(({ code }) => code) },
        });
    }

    private async getUses({ quest, account }: { quest: TQuestInvite; account?: TAccount }) {
        if (!account) return 0;

        const codes = await QuestInviteCode.find({ questId: String(quest._id), sub: account.sub });
        const uses = await Participant.countDocuments({
            poolId: quest.poolId,
            inviteCode: { $in: codes.map(({ code }) => code) },
        });
        return uses;
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
