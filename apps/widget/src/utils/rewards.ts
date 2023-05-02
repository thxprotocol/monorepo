import { RewardSortVariant, RewardVariant } from '../types/enums/rewards';
import { sortDailyRewards, sortConditionalRewards, sortMilestoneRewards } from '../utils/sort';

export function toNumber(value?: boolean) {
    return value === undefined ? 0 : Number(value);
}

export const rewardComponentMap = {
    [RewardVariant.Daily]: 'BaseCardRewardDaily',
    [RewardVariant.Referral]: 'BaseCardRewardReferral',
    [RewardVariant.Conditional]: 'BaseCardRewardPoints',
    [RewardVariant.Milestone]: 'BaseCardRewardMilestone',
};

export const sortMap: { [k: number]: any } = {
    [RewardSortVariant.Available]: (a: any, b: any): any => {
        switch (a.component) {
            case 'BaseCardRewardDaily':
                return sortDailyRewards(a, b);
            case 'BaseCardRewardReferral':
                return -1;
            case 'BaseCardRewardPoints':
                return sortConditionalRewards(a, b);
            case 'BaseCardRewardMilestone':
                return sortMilestoneRewards(a, b);
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
