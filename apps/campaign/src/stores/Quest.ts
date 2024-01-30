import { defineStore } from 'pinia';
import { useAccountStore } from './Account';
import { track } from '@thxnetwork/mixpanel';
import { ChainId } from '@thxnetwork/sdk/src/lib/types/enums/ChainId';
import { filterAvailableMap } from '../utils/quests';
import poll from 'promise-poller';

export const useQuestStore = defineStore('quest', {
    state: (): TQuestState => ({
        quests: [],
        jobs: {},
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
            const { api, account, poolId, config } = useAccountStore();
            const { error, jobId } = await api.quests.gitcoin.entry.create(uuid, payload);
            if (error) {
                throw new Error(error);
            } else {
                track('UserCreates', [account?.sub, 'gitcoin quest entry', { poolId, origin: config.origin }]);
                await this.waitForQuestEntryJob(jobId);

                const index = this.quests.findIndex((r) => r.uuid === uuid);
                this.quests[index].isClaimed = true;
            }
        },
        async completeWeb3Quest(uuid: string, payload: { signature: string; message: string; chainId: ChainId }) {
            const { api, account, poolId, config } = useAccountStore();
            const { error, jobId } = await api.quests.web3.entry.create(uuid, payload);
            if (error) {
                throw new Error(error);
            } else {
                track('UserCreates', [account?.sub, 'web3 quest entry', { poolId, origin: config.origin }]);
                await this.waitForQuestEntryJob(jobId);

                const index = this.quests.findIndex((r) => r.uuid === uuid);
                this.quests[index].isClaimed = true;
            }
        },
        async completeSocialQuest(id: string) {
            const { api, account, poolId, config } = useAccountStore();
            const { error, jobId } = await api.quests.social.entry.create(id);
            if (error) {
                throw new Error(error);
            } else {
                track('UserCreates', [account?.sub, 'conditional reward claim', { poolId, origin: config.origin }]);

                await this.waitForQuestEntryJob(jobId);

                const index = this.quests.findIndex((r) => r._id === id);
                this.quests[index].isClaimed = true;
            }
        },
        async completeCustomQuest(quest: TQuestCustom) {
            const { api, account, poolId, config } = useAccountStore();
            const { error, jobId } = await api.quests.custom.entry.create(quest.uuid);
            if (error) {
                throw new Error(error);
            } else {
                track('UserCreates', [account?.sub, 'milestone reward claim', { poolId, origin: config.origin }]);
                await this.waitForQuestEntryJob(jobId);
            }
        },
        async completeInviteQuest(uuid: string) {
            const { account, config, setConfig, poolId, api } = useAccountStore();
            if (!config.ref) return;

            const { sub } = JSON.parse(window.atob(config.ref));
            const { error, jobId } = await api.quests.invite.entry.create(uuid, { sub });
            if (error) {
                throw new Error(error);
            } else {
                setConfig(poolId, { ref: '' } as TWidgetConfig);
                track('UserCreates', [account?.sub, 'referral reward claim', { poolId, origin: config.origin }]);
                this.waitForQuestEntryJob(jobId);
            }
        },
        async completeDailyQuest(reward: TQuestDaily) {
            const { api, account, poolId, config } = useAccountStore();
            const { error, jobId } = await api.quests.daily.entry.create(reward._id);

            if (error) {
                throw new Error(error);
            } else {
                track('UserCreates', [account?.sub, 'daily reward claim', { poolId, origin: config.origin }]);
                this.waitForQuestEntryJob(jobId);
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
        async getQuestEntryJob(jobId: string) {
            const { api } = useAccountStore();
            this.jobs[jobId] = await api.request.get(`/v1/jobs/${jobId}`);
        },
        async waitForQuestEntryJob(jobId: string) {
            const taskFn = async () => {
                () => this.getQuestEntryJob(jobId);
                return this.jobs[jobId].lastRunAt ? Promise.resolve() : Promise.reject('Job not finished');
            };

            await poll({ taskFn, interval: 3000, retries: 20 });

            useAccountStore().getBalance();
        },
    },
});
