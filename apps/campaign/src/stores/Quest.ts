import { defineStore } from 'pinia';
import { useAccountStore } from './Account';
import { track } from '@thxnetwork/mixpanel';
import { ChainId } from '@thxnetwork/sdk/src/lib/types/enums/ChainId';
import poll from 'promise-poller';
import { useWalletStore } from './Wallet';

export const useQuestStore = defineStore('quest', {
    state: (): TQuestState => ({
        quests: [],
        jobs: {},
        isLoading: true,
    }),
    getters: {
        available: (state) => {
            return state.quests.filter((q: TBaseQuest) => q.isAvailable);
        },
        availablePoints: (state) => {
            const quests = state.quests.filter((q: TBaseQuest) => q.isAvailable);
            if (!quests.length) return 0;
            return quests.reduce((total: number, quest: any) => total + Number(quest.amount), 0);
        },
    },
    actions: {
        async completeGitcoinQuest(
            quest: TQuestGitcoin,
            payload: { signature: string; message: string; chainId: ChainId },
        ) {
            const { api, account, poolId, config } = useAccountStore();
            const { error, jobId } = await api.quests.gitcoin.entry.create(quest._id, payload);
            if (error) throw new Error(error);

            track('UserCreates', [account?.sub, 'gitcoin quest entry', { poolId, origin: config.origin }]);
            await this.waitForQuestEntryJob(jobId);

            const index = this.quests.findIndex((r) => r._id === quest._id);
            this.quests[index].isAvailable = false;
        },
        async completeWeb3Quest(quest: TQuestWeb3, payload: { signature: string; message: string; chainId: ChainId }) {
            const { api, account, poolId, config } = useAccountStore();
            const { error, jobId } = await api.quests.web3.entry.create(quest._id, payload);
            if (error) throw new Error(error);

            track('UserCreates', [account?.sub, 'web3 quest entry', { poolId, origin: config.origin }]);
            await this.waitForQuestEntryJob(jobId);

            const index = this.quests.findIndex((r) => r._id === quest._id);
            this.quests[index].isAvailable = false;
        },
        async completeSocialQuest(quest: TQuestSocial) {
            const { api, account, poolId, config } = useAccountStore();
            const { error, jobId } = await api.quests.social.entry.create(quest._id);
            if (error) throw new Error(error);

            track('UserCreates', [account?.sub, 'conditional reward claim', { poolId, origin: config.origin }]);
            await this.waitForQuestEntryJob(jobId);

            // TODO Fetch daily quest again here
            const index = this.quests.findIndex((r) => r._id === quest._id);
            this.quests[index].isAvailable = false;
        },
        async completeCustomQuest(quest: TQuestCustom) {
            const { api, account, poolId, config } = useAccountStore();
            if (!account) return;

            const { error, jobId } = await api.quests.custom.entry.create(quest._id);
            if (error) throw new Error(error);

            track('UserCreates', [account.sub, 'milestone reward claim', { poolId, origin: config.origin }]);
            await this.waitForQuestEntryJob(jobId);

            // TODO Fetch custom quest again here
            const index = this.quests.findIndex((r) => r._id === quest._id);
            (this.quests[index] as TQuestCustom).entries.push({
                questId: quest._id,
                uuid: '',
                sub: account.sub,
                isClaimed: true,
                amount: quest.amount,
            });
        },
        async completeInviteQuest(quest: TQuestInvite) {
            const { account, config, setConfig, poolId, api } = useAccountStore();
            if (!config.ref) return;

            const { sub } = JSON.parse(window.atob(config.ref));
            const { error, jobId } = await api.quests.invite.entry.create(quest.uuid, { sub });
            if (error) throw new Error(error);

            setConfig(poolId, { ref: '' } as TWidgetConfig);
            track('UserCreates', [account?.sub, 'referral reward claim', { poolId, origin: config.origin }]);

            await this.waitForQuestEntryJob(jobId);

            const index = this.quests.findIndex((r) => r._id === quest._id);
            this.quests[index].isAvailable = false;
        },
        async completeDailyQuest(quest: TQuestDaily) {
            const { api, account, poolId, config } = useAccountStore();
            const { error, jobId } = await api.quests.daily.entry.create(quest._id);
            if (error) throw new Error(error);

            track('UserCreates', [account?.sub, 'daily reward claim', { poolId, origin: config.origin }]);
            await this.waitForQuestEntryJob(jobId);

            // TODO Fetch daily quest again here
            const index = this.quests.findIndex((r) => r._id === quest._id);
            this.quests[index].isAvailable = false;
        },

        async list() {
            const { api } = useAccountStore();
            this.isLoading = true;

            const { gitcoin, invite, twitter, discord, youtube, custom, daily, web3 } = await api.quests.list();
            const socialQuestList = [...twitter, ...discord, ...youtube];

            this.quests = [...gitcoin, ...invite, ...socialQuestList, ...custom, ...daily, ...web3];
            this.isLoading = false;
        },

        async waitForQuestEntryJob(jobId: string) {
            const { api } = useAccountStore();
            const taskFn = async () => {
                const job = await api.request.get(`/v1/jobs/${jobId}`);
                return job && !!job.lastRunAt ? Promise.resolve() : Promise.reject('Job not finished');
            };

            // Poll for job to finish
            await poll({ taskFn, interval: 1000, retries: 5 });
            useAccountStore().getBalance();
        },
    },
});
