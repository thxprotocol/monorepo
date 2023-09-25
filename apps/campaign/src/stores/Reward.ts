import { defineStore } from 'pinia';
import { useAccountStore } from './Account';
import { track } from '@thxnetwork/mixpanel';
import { QuestVariant } from '../types/enums/rewards';
import { ChainId } from '@thxnetwork/sdk/src/lib/types/enums/ChainId';

export const useRewardStore = defineStore('rewards', {
    state: (): TQuestState => ({
        rewards: [],
        leaderboard: [],
    }),
    actions: {
        async completeWeb3Quest(uuid: string, payload: { signature: string; message: string; chainId: ChainId }) {
            const { api, account, getBalance, poolId, getConfig } = useAccountStore();
            const claim = await api.quests.web3.complete(uuid, payload);
            if (claim.error) throw new Error(claim.error);

            track('UserCreates', [account?.sub, 'web3 quest entry', { poolId, origin: getConfig(poolId).origin }]);

            getBalance();

            const index = this.rewards.findIndex((r) => r.uuid === uuid);
            this.rewards[index].isClaimed = true;
        },
        async completeSocialQuest(id: string) {
            const { api, account, getBalance, poolId, getConfig } = useAccountStore();
            const claim = await api.quests.social.complete(id);
            if (claim.error) throw new Error(claim.error);

            track('UserCreates', [
                account?.sub,
                'conditional reward claim',
                { poolId, origin: getConfig(poolId).origin },
            ]);

            getBalance();

            const index = this.rewards.findIndex((r) => r._id === id);
            this.rewards[index].isClaimed = true;
        },
        async completeCustomQuest(reward: TQuestCustom) {
            const { api, account, getBalance, poolId, getConfig } = useAccountStore();
            const pendingClaims = reward.claims.filter((c) => !c.isClaimed);
            if (!pendingClaims.length) return;

            const uuid = pendingClaims[0].uuid;
            const claim = await api.quests.custom.complete(uuid);

            if (claim.error) throw claim.error;

            track('UserCreates', [
                account?.sub,
                'milestone reward claim',
                { poolId, origin: getConfig(poolId).origin },
            ]);

            getBalance();

            await this.list();
        },
        async completeInviteQuest(uuid: string) {
            const { account, getConfig, setConfig, poolId, api } = useAccountStore();
            const { ref } = getConfig(poolId);
            if (!ref) return;

            const { sub } = JSON.parse(window.atob(ref));
            await api.quests.invite.complete(uuid, { sub });

            setConfig(poolId, { ref: '' } as TWidgetConfig);

            track('UserCreates', [account?.sub, 'referral reward claim', { poolId, origin: getConfig(poolId).origin }]);
        },
        async completeDailyQuest(reward: TQuestDaily) {
            const { api, account, getBalance, poolId, getConfig } = useAccountStore();
            const claim = await api.quests.daily.complete(reward._id);

            if (claim.error) {
                throw claim.error;
            } else {
                track('UserCreates', [
                    account?.sub,
                    'daily reward claim',
                    { poolId, origin: getConfig(poolId).origin },
                ]);

                getBalance();

                await this.list();
            }
        },

        async list() {
            const { api } = useAccountStore();
            const { leaderboard, referralRewards, pointRewards, milestoneRewards, dailyRewards, web3Quests } =
                await api.quests.list();

            this.leaderboard = leaderboard;

            const dailyRewardsArray = Object.values(dailyRewards);
            const dailyRewardsList = dailyRewardsArray.map((a: any) => {
                a.variant = QuestVariant.Daily;
                return a;
            });

            const referralRewardsList = Object.values(referralRewards).map((r: any) => {
                r.variant = QuestVariant.Invite;
                return r;
            });

            const pointRewardsArray = Object.values(pointRewards);
            const pointRewardsList = pointRewardsArray.map((a: any): TQuestDaily => {
                a.contentMetadata = a.contentMetadata && JSON.parse(a.contentMetadata);
                a.variant = QuestVariant.Social;
                return a;
            });

            const milestoneRewardsArray = Object.values(milestoneRewards);
            const milestoneRewardsList = milestoneRewardsArray.map((a: any): TQuestCustom => {
                a.variant = QuestVariant.Custom;
                return a;
            });

            const web3QuestsArray = Object.values(web3Quests);
            const web3QuestsList = web3QuestsArray.map((a: any): TQuestWeb3 => {
                a.variant = QuestVariant.Web3;
                return a;
            });

            this.rewards = [
                ...milestoneRewardsList,
                ...pointRewardsList,
                ...dailyRewardsList,
                ...referralRewardsList,
                ...web3QuestsList,
            ];
        },
    },
});
