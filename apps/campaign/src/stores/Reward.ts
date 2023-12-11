import { defineStore } from 'pinia';
import { useAccountStore } from './Account';
import { track } from '@thxnetwork/mixpanel';
import { QuestVariant } from '../types/enums/rewards';
import { ChainId } from '@thxnetwork/sdk/src/lib/types/enums/ChainId';
import { filterAvailableMap } from '../utils/quests';

export const useRewardStore = defineStore('rewards', {
    state: (): TQuestState => ({
        quests: [],
        leaderboard: [],
    }),
    getters: {
        available: (state) => {
            return state.quests.filter((q: TBaseQuest) => filterAvailableMap[q.variant](q));
        },
        availablePoints: (state) => {
            const rest = state.quests.filter((q: TBaseQuest) => filterAvailableMap[q.variant](q));
            if (!rest.length) return 0;
            return rest.reduce((total: number, quest: any) => total + Number(quest.pointsAvailable), 0);
        },
    },
    actions: {
        async completeWeb3Quest(uuid: string, payload: { signature: string; message: string; chainId: ChainId }) {
            const { api, account, getBalance, poolId, config } = useAccountStore();
            const claim = await api.quests.web3.complete(uuid, payload);
            if (claim.error) throw new Error(claim.error);

            track('UserCreates', [account?.sub, 'web3 quest entry', { poolId, origin: config.origin }]);

            getBalance();

            const index = this.quests.findIndex((r) => r.uuid === uuid);
            this.quests[index].isClaimed = true;
        },
        async completeSocialQuest(id: string) {
            const { api, account, getBalance, poolId, config } = useAccountStore();
            const claim = await api.quests.social.complete(id);
            if (claim.error) throw new Error(claim.error);

            track('UserCreates', [account?.sub, 'conditional reward claim', { poolId, origin: config.origin }]);

            getBalance();

            const index = this.quests.findIndex((r) => r._id === id);
            this.quests[index].isClaimed = true;
        },
        async completeCustomQuest(reward: TQuestCustom) {
            const { api, account, getBalance, poolId, config } = useAccountStore();
            const pendingClaims = reward.claims.filter((c) => !c.isClaimed);
            if (!pendingClaims.length) return;

            const uuid = pendingClaims[0].uuid;
            const claim = await api.quests.custom.complete(uuid);

            if (claim.error) throw claim.error;

            track('UserCreates', [account?.sub, 'milestone reward claim', { poolId, origin: config.origin }]);

            getBalance();
        },
        async completeInviteQuest(uuid: string) {
            const { account, config, setConfig, poolId, api } = useAccountStore();
            if (!config.ref) return;

            const { sub } = JSON.parse(window.atob(config.ref));
            await api.quests.invite.complete(uuid, { sub });

            setConfig(poolId, { ref: '' } as TWidgetConfig);

            track('UserCreates', [account?.sub, 'referral reward claim', { poolId, origin: config.origin }]);
        },
        async completeDailyQuest(reward: TQuestDaily) {
            const { api, account, getBalance, poolId, config } = useAccountStore();
            const claim = await api.quests.daily.complete(reward._id);

            if (claim.error) {
                throw claim.error;
            } else {
                track('UserCreates', [account?.sub, 'daily reward claim', { poolId, origin: config.origin }]);

                getBalance();
            }
        },

        async list() {
            const { api, isAuthenticated } = useAccountStore();
            const { leaderboard, invite, social, custom, daily, web3 } = await api.quests.list();

            this.leaderboard = leaderboard;

            const dailyRewardsArray = Object.values(daily);
            const dailyRewardsList = dailyRewardsArray.map((a: any) => {
                a.variant = QuestVariant.Daily;
                return a;
            });

            const referralRewardsList = Object.values(invite).map((r: any) => {
                r.variant = QuestVariant.Invite;
                return r;
            });

            const pointRewardsArray = Object.values(social);
            const pointRewardsList = pointRewardsArray.map((a: any): TQuestSocial => {
                a.contentMetadata = a.contentMetadata && JSON.parse(a.contentMetadata);
                a.variant = QuestVariant.Social;
                return a;
            });

            const milestoneRewardsArray = Object.values(custom);
            const milestoneRewardsList = milestoneRewardsArray.map((a: any): TQuestCustom => {
                a.variant = QuestVariant.Custom;
                return a;
            });

            const web3QuestsArray = Object.values(web3);
            const web3QuestsList = web3QuestsArray.map((a: any): TQuestWeb3 => {
                a.variant = QuestVariant.Web3;
                return a;
            });

            this.quests = [
                ...milestoneRewardsList,
                ...pointRewardsList,
                ...dailyRewardsList,
                ...referralRewardsList,
                ...web3QuestsList,
            ];

            // Logic past this point is considered authenticated
            if (!isAuthenticated) return;

            await Promise.all(pointRewardsList.map((quest) => this.getSocialQuest(quest._id)));
        },

        setQuestSocial(quest: TQuestSocial) {
            const index = this.quests.findIndex((q) => q._id === quest._id);

            quest.contentMetadata = quest.contentMetadata && JSON.parse(quest.contentMetadata);
            quest.variant = QuestVariant.Social;

            this.quests[index] = quest as any;
        },

        async getSocialQuest(id: string) {
            const { api } = useAccountStore();
            const quest = await api.request.get(`/v1/quests/social/${id}`);
            this.setQuestSocial(quest);
        },

        async getLeaderboard() {
            const { api, poolId } = useAccountStore();
            const leaderboard = await api.request.get(`/v1/leaderboards/${poolId}`);
            this.leaderboard = leaderboard;
        },
    },
});
