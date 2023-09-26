import { RewardSortVariant, QuestVariant } from '../types/enums/rewards';
import { sortDailyRewards, sortConditionalRewards, sortMilestoneRewards, sortWeb3Rewards } from '../utils/sort';

export function toNumber(value?: boolean) {
    return value === undefined ? 0 : Number(value);
}

export const rewardComponentMap = {
    [QuestVariant.Daily]: 'BaseCardQuestDaily',
    [QuestVariant.Invite]: 'BaseCardQuestInvite',
    [QuestVariant.Social]: 'BaseCardQuestSocial',
    [QuestVariant.Custom]: 'BaseCardQuestCustom',
    [QuestVariant.Web3]: 'BaseCardQuestWeb3',
};

export const filterAvailableMap: any = {
    [QuestVariant.Daily]: (quest: TQuestDaily & { claimAgainDuration: number }) => quest.claimAgainDuration <= 0,
    [QuestVariant.Invite]: (quest: TQuestInvite) => !!quest,
    [QuestVariant.Social]: (quest: TQuestSocial) => !quest.isClaimed,
    [QuestVariant.Custom]: (quest: TQuestCustom) =>
        quest.claims.length - quest.claims.filter((c: TQuestCustomClaim) => c.isClaimed).length > 0,
    [QuestVariant.Web3]: (quest: TQuestWeb3) => !quest.isClaimed,
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
