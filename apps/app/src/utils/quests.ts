import { RewardSortVariant, QuestVariant } from '../types/enums/rewards';

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
    [QuestVariant.Webhook]: 'BaseCardQuestWebhook',
};

export const sortMap: { [k: number]: any } = {
    [RewardSortVariant.Default]: (a: any, b: any): any => {
        return a.index - b.index;
    },
    [RewardSortVariant.Amount]: (a: any, b: any): any => {
        return a.amount > b.amount ? -1 : 1;
    },
    [RewardSortVariant.Created]: (a: any, b: any): any => {
        return a.createdAt > b.createdAt ? -1 : 1;
    },
};
