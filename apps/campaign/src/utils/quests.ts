import { RewardSortVariant, QuestVariant } from '../types/enums/rewards';
import {
    sortDailyRewards,
    sortConditionalRewards,
    sortMilestoneRewards,
    sortWeb3Rewards,
    sortGitcoinRewards,
} from '../utils/sort';

export function toNumber(value?: boolean) {
    return value === undefined ? 0 : Number(value);
}

export const questComponentMap: any = {
    [QuestVariant.Daily]: 'BaseCardQuestDaily',
    [QuestVariant.Invite]: 'BaseCardQuestInvite',
    [QuestVariant.Twitter]: 'BaseCardQuestSocial',
    [QuestVariant.Discord]: 'BaseCardQuestSocial',
    [QuestVariant.YouTube]: 'BaseCardQuestSocial',
    [QuestVariant.Custom]: 'BaseCardQuestCustom',
    [QuestVariant.Web3]: 'BaseCardQuestWeb3',
    [QuestVariant.Gitcoin]: 'BaseCardQuestGitcoin',
};

export const filterAvailableMap: any = {
    [QuestVariant.Daily]: (quest: TQuestDaily & { claimAgainDuration: number }) => quest.claimAgainDuration <= 0,
    [QuestVariant.Invite]: (quest: TQuestInvite) => !!quest,
    [QuestVariant.Twitter]: (quest: TQuestSocial) => !quest.isClaimed,
    [QuestVariant.Discord]: (quest: TQuestSocial) => !quest.isClaimed,
    [QuestVariant.YouTube]: (quest: TQuestSocial) => !quest.isClaimed,
    [QuestVariant.Custom]: (quest: TQuestCustom) => !quest.claims.length || quest.limit - quest.claims.length > 0,
    [QuestVariant.Web3]: (quest: TQuestWeb3) => !quest.isClaimed,
    [QuestVariant.Gitcoin]: (quest: TQuestWeb3) => !quest.isClaimed,
};

export const sortMap: { [k: number]: any } = {
    [RewardSortVariant.Default]: (a: any, b: any): any => {
        return a.index - b.index;
    },
    [RewardSortVariant.Available]: (a: any, b: any): any => {
        switch (a.component) {
            case 'BaseCardQuestDaily':
                return sortDailyRewards(a, b);
            case 'BaseCardQuestInvite':
                return -1;
            case 'BaseCardQuestSocial':
                return sortConditionalRewards(a, b);
            case 'BaseCardQuestCustom':
                return sortMilestoneRewards(a, b);
            case 'BaseCardQuestWeb3':
                return sortWeb3Rewards(a, b);
            case 'BaseCardQuestGitcoin':
                return sortGitcoinRewards(a, b);
            default:
                return 0;
        }
    },
    [RewardSortVariant.Amount]: (a: any, b: any): any => {
        return a.amount > b.amount ? -1 : 1;
    },
    [RewardSortVariant.Created]: (a: any, b: any): any => {
        return a.createdAt > b.createdAt ? -1 : 1;
    },
};
