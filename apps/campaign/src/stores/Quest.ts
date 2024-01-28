import { defineStore } from 'pinia';
import { useAccountStore } from './Account';
import { track } from '@thxnetwork/mixpanel';
import { ChainId } from '@thxnetwork/sdk/src/lib/types/enums/ChainId';
import { filterAvailableMap } from '../utils/quests';

export const useQuestStore = defineStore('quest', {
    state: (): TQuestState => ({
        quests: [],
        isLoading: true,
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
        async completeGitcoinQuest(uuid: string, payload: { signature: string; message: string; chainId: ChainId }) {
            const { api, account, getBalance, poolId, config } = useAccountStore();
            const claim = await api.quests.gitcoin.entry.create(uuid, payload);
            if (claim.error) throw new Error(claim.error);

            track('UserCreates', [account?.sub, 'gitcoin quest entry', { poolId, origin: config.origin }]);

            getBalance();

            const index = this.quests.findIndex((r) => r.uuid === uuid);
            this.quests[index].isClaimed = true;
        },
        async completeWeb3Quest(uuid: string, payload: { signature: string; message: string; chainId: ChainId }) {
            const { api, account, getBalance, poolId, config } = useAccountStore();
            const claim = await api.quests.web3.entry.create(uuid, payload);
            if (claim.error) throw new Error(claim.error);

            track('UserCreates', [account?.sub, 'web3 quest entry', { poolId, origin: config.origin }]);

            getBalance();

            const index = this.quests.findIndex((r) => r.uuid === uuid);
            this.quests[index].isClaimed = true;
        },
        async completeSocialQuest(id: string) {
            const { api, account, getBalance, poolId, config } = useAccountStore();
            const claim = await api.quests.social.entry.create(id);
            if (claim.error) throw new Error(claim.error);

            track('UserCreates', [account?.sub, 'conditional reward claim', { poolId, origin: config.origin }]);

            getBalance();

            const index = this.quests.findIndex((r) => r._id === id);
            this.quests[index].isClaimed = true;
        },
        async completeCustomQuest(quest: TQuestCustom) {
            const { api, account, getBalance, poolId, config } = useAccountStore();
            const entry = await api.quests.custom.entry.create(quest.uuid);
            if (entry.error) throw entry.error;

            track('UserCreates', [account?.sub, 'milestone reward claim', { poolId, origin: config.origin }]);

            getBalance();
        },
        async completeInviteQuest(uuid: string) {
            const { account, config, setConfig, poolId, api } = useAccountStore();
            if (!config.ref) return;

            const { sub } = JSON.parse(window.atob(config.ref));
            await api.quests.invite.entry.create(uuid, { sub });

            setConfig(poolId, { ref: '' } as TWidgetConfig);

            track('UserCreates', [account?.sub, 'referral reward claim', { poolId, origin: config.origin }]);
        },
        async completeDailyQuest(reward: TQuestDaily) {
            const { api, account, getBalance, poolId, config } = useAccountStore();
            const claim = await api.quests.daily.entry.create(reward._id);

            if (claim.error) {
                throw claim.error;
            } else {
                track('UserCreates', [account?.sub, 'daily reward claim', { poolId, origin: config.origin }]);

                getBalance();
            }
        },

        async list() {
            const { api } = useAccountStore();
            this.isLoading = true;

            const { gitcoin, invite, twitter, discord, youtube, custom, daily, web3 } = await api.quests.list();
            const socialQuestList = [...twitter, ...discord, ...youtube];

            this.quests = [...gitcoin, ...invite, ...socialQuestList, ...custom, ...daily, ...web3];
            await Promise.all(socialQuestList.map((quest) => this.getSocialQuest(quest._id)));

            this.isLoading = false;
        },

        setQuestSocial(quest: TQuestSocial) {
            const index = this.quests.findIndex((q) => q._id === quest._id);
            this.quests[index] = quest as TAnyQuest;
        },

        async getSocialQuest(id: string) {
            const { api, isAuthenticated } = useAccountStore();
            if (!isAuthenticated) return;

            const quest = await api.request.get(`/v1/quests/social/${id}`);
            this.setQuestSocial(quest);
        },
    },
});
