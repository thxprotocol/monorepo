import { Event, Identity, Pool, QuestDaily, QuestDailyEntry } from '@thxnetwork/api/models';
import { IQuestService } from './interfaces/IQuestService';
import { Request } from 'express';
import { getIP } from '../util/ip';

const ONE_DAY_MS = 86400 * 1000; // 24 hours in milliseconds

export default class QuestDailyService implements IQuestService {
    models = {
        quest: QuestDaily,
        entry: QuestDailyEntry,
    };

    async getDataForRequest(req: Request): Promise<Partial<TQuestEntry>> {
        const now = Date.now(),
            start = now - ONE_DAY_MS,
            end = now;

        return { metadata: { ip: getIP(req) }, now, start, end };
    }

    async findEntryMetadata({ quest }: { quest: TQuestDaily }) {
        const uniqueParticipantIds = await this.models.entry
            .countDocuments({
                questId: String(quest._id),
            })
            .distinct('sub');

        return { participantCount: uniqueParticipantIds.length };
    }

    async decorate({
        quest,
        account,
    }: {
        quest: TQuestDaily;
        data: Partial<TQuestDailyEntry>;
        account?: TAccount;
    }): Promise<
        TQuestDaily & {
            isAvailable: boolean;
            amount: number;
            entries: TQuestDailyEntry[];
            claimAgainDuration: number;
            isCompleted: boolean;
        }
    > {
        const amount = await this.getAmount({ quest, account });
        const entries = account ? await this.findEntries({ quest, account }) : [];
        
        // Use the last completed quest time + 24 hours for claimAgainTime
        const lastEntryTime = entries.length ? new Date(entries[0].createdAt).getTime() : null;
        const claimAgainTime = lastEntryTime ? lastEntryTime + ONE_DAY_MS : null;
        const now = Date.now();
        
        const isAvailable = await this.isAvailable({ quest, account });
        const isCompleted = entries.length >= Object.keys(quest.amounts).length;
        return {
            ...quest,
            isAvailable: isAvailable.result,
            amount,
            entries,
            claimAgainDuration:
                claimAgainTime && claimAgainTime - now > 0 ? Math.floor((claimAgainTime - now) / 1000) : null, // Convert to seconds
            isCompleted,
        };
    }

    async isAvailable({ quest, account }: { quest: TQuestDaily; account: TAccount }): Promise<TValidationResult> {
        if (!account) return { result: true, reason: '' };
        
        // Fetch all completed entries for the quest
        const entries = await QuestDailyEntry.find({
            questId: quest._id,
            sub: account.sub,
        }).sort({ createdAt: -1 });
    
        // If the number of completed entries is equal to the number of days in the `amounts` array, mark the quest as unavailable
        if (entries.length >= Object.keys(quest.amounts).length) {
            return { result: false, reason: 'All quest entries have been completed.' };
        }
    
        const now = Date.now();
    
        // Get the last quest entry for this user
        const lastEntry = entries.length ? entries[0] : null;
    
        // If there is no last entry, allow the quest to be completed
        if (!lastEntry) return { result: true, reason: '' };
    
        // Calculate if 24 hours have passed since the last completion
        const claimAgainTime = new Date(lastEntry.createdAt).getTime() + ONE_DAY_MS;
    
        if (now >= claimAgainTime) {
            return { result: true, reason: '' };
        }
    
        // Otherwise, the quest is unavailable until 24 hours have passed
        return { result: false, reason: 'You need to wait 24 hours before completing the next quest.' };
    }

    async getAmount({ quest, account }: { quest: TQuestDaily; account: TAccount }): Promise<number> {
        if (!account) return quest.amounts[0];

        const claims = await this.findEntries({ quest, account });
        const amountIndex =
            claims.length >= quest.amounts.length ? claims.length % quest.amounts.length : claims.length;
        return quest.amounts[amountIndex];
    }

    async getValidationResult({
        quest,
        account,
        data,
    }: {
        quest: TQuestDaily;
        account: TAccount;
        data: Partial<TQuestDailyEntry> & { start: number; end: number };
    }): Promise<TValidationResult> {
        const entry = await QuestDailyEntry.findOne({
            questId: quest._id,
            sub: account.sub,
            createdAt: { $gt: new Date(data.start), $lt: new Date(data.end) },
        });

        // If an entry has been found the user needs to wait
        if (entry) {
            return { result: false, reason: `Already completed within the last 24 hours.` };
        }

        // If no entry has been found and no event is required the entry is allowed to be created
        if (!quest.eventName) {
            return { result: true, reason: '' };
        }

        // If an event is required we check if there is an event found within the time window
        const pool = await Pool.findById(quest.poolId);
        const identities = await this.findIdentities({ pool, account });
        if (!identities.length) {
            return {
                result: false,
                reason: 'No identity connected to this account. Please ask for this in your community!',
            };
        }
        const identityIds = identities.map(({ id }) => id);
        const events = await Event.find({
            name: quest.eventName,
            sub: pool.sub,
            identityId: { $in: identityIds },
            createdAt: { $gt: new Date(data.start), $lt: new Date(data.end) },
        });

        if (!events.length) {
            return { result: false, reason: 'No events found for this account' };
        }

        return { result: true, reason: '' };
    }

    private async findIdentities({ pool, account }: { pool: TPool; account: TAccount }) {
        return await Identity.find({ sub: pool.sub, accountId: account.sub });
    }

    private async findEntries({ account, quest }: { account: TAccount; quest: TQuestDaily }) {
        // Fetch all entries for the quest, sorted by creation date (latest first)
        const claims = await QuestDailyEntry.find({
            questId: quest._id,
            sub: account.sub,
        }).sort({ createdAt: -1 });
    
        return claims;
    }

    private async getLastEntry(account: TAccount, quest: TQuestDaily) {
        const lastEntry = await QuestDailyEntry.findOne({
            questId: quest._id,
            sub: account.sub,
        }).sort({ createdAt: -1 });
        return lastEntry;
    }
}