import { Model } from 'mongoose';
import QuestInviteService from '../QuestInviteService';
import QuestDiscordService from '../QuestDiscordService';
import QuestTwitterService from '../QuestSocialService'; // Split
import QuestYouTubeService from '../QuestSocialService'; // Split
import QuestDailyService from '../QuestDailyService';
import QuestCustomService from '../QuestCustomService';
import QuestGitcoinService from '../QuestGitcoinService';
import QuestWeb3Service from '../QuestWeb3Service';
import QuestWebhookService from '../QuestWebhookService';
import { QuestVariant } from '@thxnetwork/common/enums';
import { PoolDocument } from '@thxnetwork/api/models';
import { Request } from 'express';
import QuestCashbackService from '../QuestCashbackService';

export interface IQuestInviteService extends IQuestService {
    assertQuestEntry(options: { pool: PoolDocument; quest: TQuest; account: TAccount }): Promise<void>;
    createInvitee(sub: string, code: string): Promise<TInvitee>;
}

export interface IQuestService {
    models: { quest: Model<TQuest>; entry: Model<TQuestEntry> };
    decorate(options: { quest: TQuest; account?: TAccount; data: Partial<TQuestEntry> }): Promise<TQuest>;
    isAvailable(options: { quest: TQuest; account?: TAccount }): Promise<TValidationResult>;
    getDataForRequest(req: Request, options: { quest: TQuest; account: TAccount }): Promise<Partial<TQuestEntry>>;
    getAmount(options: { quest: TQuest; account?: TAccount; data?: any }): Promise<number>;
    getValidationResult(options: {
        quest: TQuest;
        account: TAccount;
        data: Partial<TQuestEntry>;
    }): Promise<TValidationResult>;
    findEntryMetadata(options: { quest: TQuest });
}

export const serviceMap: {
    [variant: number]: IQuestService;
} = {
    [QuestVariant.Daily]: new QuestDailyService(),
    [QuestVariant.Invite]: new QuestInviteService(),
    [QuestVariant.Discord]: new QuestDiscordService(),
    [QuestVariant.Twitter]: new QuestTwitterService(),
    [QuestVariant.YouTube]: new QuestYouTubeService(),
    [QuestVariant.Custom]: new QuestCustomService(),
    [QuestVariant.Web3]: new QuestWeb3Service(),
    [QuestVariant.Gitcoin]: new QuestGitcoinService(),
    [QuestVariant.Webhook]: new QuestWebhookService(),
    [QuestVariant.CashbackPlaywall]: new QuestCashbackService()
};
