import {
    QuestCustom,
    QuestCustomDocument,
    QuestCustomEntry,
    Identity,
    IdentityDocument,
    Event,
    WalletDocument,
    Pool,
    PoolDocument,
} from '@thxnetwork/api/models';
import { IQuestService } from './interfaces/IQuestService';
import { Request } from 'express';

export default class QuestCustomService implements IQuestService {
    models = {
        quest: QuestCustom,
        entry: QuestCustomEntry,
    };

    async getDataForRequest(
        req: Request,
        options: { quest: TQuest; account: TAccount },
    ): Promise<Partial<TQuestEntry>> {
        return {};
    }

    async findEntryMetadata({ quest }: { quest: QuestCustomDocument }) {
        const uniqueParticipantIds = await QuestCustomEntry.countDocuments({
            questId: String(quest._id),
        }).distinct('sub');

        return { participantCount: uniqueParticipantIds.length };
    }

    async isAvailable({
        quest,
        account,
    }: {
        quest: QuestCustomDocument;
        wallet?: WalletDocument;
        account?: TAccount;
        data: Partial<TQuestCustomEntry>;
    }): Promise<TValidationResult> {
        const entries = await this.findAllEntries({ quest, account });
        if (quest.limit && entries.length >= quest.limit) {
            return { result: false, reason: 'Quest entry limit has been reached.' };
        }

        return { result: true, reason: '' };
    }

    async getAmount({ quest }: { quest: QuestCustomDocument; wallet: WalletDocument; account: TAccount }) {
        return quest.amount;
    }

    async decorate({
        quest,
        account,
        data,
    }: {
        quest: QuestCustomDocument;
        account?: TAccount;
        data: Partial<TQuestCustomEntry>;
    }) {
        const pool = await Pool.findById(quest.poolId);
        const entries = await this.findAllEntries({ quest, account });
        const identities = await this.findIdentities({ pool, account });
        const events = await this.findEvents({ pool, quest, identities });
        const isAvailable = await this.isAvailable({ quest, account, data });
        const pointsAvailable = quest.limit ? (quest.limit - entries.length) * quest.amount : quest.amount;

        return {
            ...quest,
            eventName: '', // FK Deprecrates March 15th 2024
            isAvailable: isAvailable.result,
            pointsAvailable,
            entries,
            events,
        };
    }

    async getValidationResult({
        quest,
        account,
    }: {
        quest: QuestCustomDocument;
        account: TAccount;
        data: Partial<TQuestCustomEntry>;
    }) {
        const pool = await Pool.findById(quest.poolId);
        // See if there are identities
        const identities = await this.findIdentities({ pool, account });
        if (!identities.length) {
            return {
                result: false,
                reason: 'No identity connected to this account. Please ask for this in your community!',
            };
        }

        // Find existing entries for this quest and check optional limit
        const entries = await this.findAllEntries({ quest, account });
        if (quest.limit && entries.length >= quest.limit) {
            return { result: false, reason: 'Quest entry limit has been reached' };
        }

        // Find events for this quest and the identities connected to the account
        const events = await this.findEvents({ pool, quest, identities });
        if (entries.length >= events.length) {
            return { result: false, reason: 'Insufficient custom events found for this quest' };
        }

        if (entries.length < events.length) {
            return { result: true, reason: '' };
        } else {
            return { result: false, reason: '' };
        }
    }

    private async findAllEntries({ quest, account }: { quest: QuestCustomDocument; account: TAccount }) {
        if (!account) return [];
        return await this.models.entry.find({
            questId: quest._id,
            sub: account.sub,
        });
    }

    private async findIdentities({ pool, account }: { pool: PoolDocument; account: TAccount }) {
        if (!account || !account.sub) return [];
        return await Identity.find({ sub: pool.sub, accountId: account.sub });
    }

    private async findEvents({
        pool,
        quest,
        identities,
    }: {
        pool: PoolDocument;
        quest: QuestCustomDocument;
        identities: IdentityDocument[];
    }) {
        if (!identities.length) return [];
        return await Event.find({
            identityId: { $in: identities.map(({ _id }) => String(_id)) },
            sub: pool.sub,
            name: quest.eventName,
        }).limit(quest.limit || null);
    }
}
