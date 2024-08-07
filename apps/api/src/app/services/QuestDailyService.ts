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
        data,
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
        }
    > {
        const amount = await this.getAmount({ quest, account });
        const entries = account ? await this.findEntries({ quest, account }) : [];
        const claimAgainTime = entries.length ? new Date(entries[0].createdAt).getTime() + ONE_DAY_MS : null;
        const now = Date.now();
        const isAvailable = await this.isAvailable({ quest, account, data });

        return {
            ...quest,
            isAvailable: isAvailable.result,
            amount,
            entries,
            claimAgainDuration:
                claimAgainTime && claimAgainTime - now > 0 ? Math.floor((claimAgainTime - now) / 1000) : null, // Convert and floor to S,
        };
    }

    async isAvailable({
        quest,
        account,
    }: {
        quest: TQuestDaily;
        account: TAccount;
        data: Partial<TQuestDailyEntry>;
    }): Promise<TValidationResult> {
        if (!account) return { result: true, reason: '' };
        const now = Date.now(),
            start = now - ONE_DAY_MS,
            end = now;

        const isCompleted = await QuestDailyEntry.findOne({
            questId: quest._id,
            sub: account.sub,
            createdAt: { $gt: new Date(start), $lt: new Date(end) },
        });

        if (!isCompleted) return { result: true, reason: '' };

        return { result: false, reason: 'You have completed this quest within the last 24 hours.' };
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
        console.log({ data });
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

        // If no events are found we invalidate
        if (!events.length) {
            return { result: false, reason: 'No events found for this account' };
        }

        // If events are found we validate true
        else {
            return { result: true, reason: '' };
        }
    }

    private async findIdentities({ pool, account }: { pool: TPool; account: TAccount }) {
        return await Identity.find({ sub: pool.sub, accountId: account.sub });
    }

    private async findEntries({ account, quest }: { account: TAccount; quest: TQuestDaily }) {
        const claims = [];
        const now = Date.now(),
            start = now - ONE_DAY_MS,
            end = now;

        let lastEntry = await this.getLastEntry(account, quest, start, end);
        if (!lastEntry) return [];
        claims.push(lastEntry);

        while (lastEntry) {
            const timestamp = new Date(lastEntry.createdAt).getTime();
            lastEntry = await QuestDailyEntry.findOne({
                questId: quest._id,
                sub: account.sub,
                createdAt: {
                    $gt: new Date(timestamp - ONE_DAY_MS * 2),
                    $lt: new Date(timestamp - ONE_DAY_MS),
                },
            });
            if (!lastEntry) break;
            claims.push(lastEntry);
        }

        return claims;
    }

    private async getLastEntry(account: TAccount, quest: TQuestDaily, start: number, end: number) {
        let lastEntry = await QuestDailyEntry.findOne({
            questId: quest._id,
            sub: account.sub,
            createdAt: { $gt: new Date(start), $lt: new Date(end) },
        });

        if (!lastEntry) {
            lastEntry = await QuestDailyEntry.findOne({
                questId: quest._id,
                sub: account.sub,
                createdAt: { $gt: new Date(start - ONE_DAY_MS), $lt: new Date(end - ONE_DAY_MS) },
            });
        }
        return lastEntry;
    }
}
