import { defineStore } from 'pinia';
import { useAccountStore } from './Account';
import { track } from '@thxnetwork/app/utils/mixpanel';
import { QuestVariant } from '@thxnetwork/common/enums';
import { GCLOUD_RECAPTCHA_SITE_KEY } from '../config/secrets';

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
        // Complete a quest and remove from locks if it locks other quests
        unlock(quest: TBaseQuest) {
            for (const questIndex in this.quests) {
                // If this quest is not found in other quests locks continue
                const index = this.quests[questIndex].locks.findIndex((l: TQuestLock) => l.questId === quest._id);
                if (index === -1) continue;

                // If there is a hit remove the lock and update flag
                this.quests[questIndex].locks.splice(index, 1);
                this.quests[questIndex].isLocked = false;
            }
        },
        async getReCAPTCHAToken(action: string) {
            const { grecaptcha } = window as unknown as { grecaptcha: any };
            return new Promise((resolve) => {
                grecaptcha.enterprise.ready(async () => {
                    const token = await grecaptcha.enterprise.execute(GCLOUD_RECAPTCHA_SITE_KEY, {
                        action,
                    });
                    resolve(token);
                });
            });
        },
        async completeQuest(quest: TQuest, payload = {}) {
            const { api, account, poolId, waitForJob } = useAccountStore();
            if (!account) return;

            /// Non generic data for quest types. Should be refactored.
            const callback = () => {
                const index = this.quests.findIndex((r) => r._id === quest._id);
                this.quests[index].isAvailable = false;
            };
            const questEntrySocialDetails = { apiKey: 'social', eventKey: 'conditional reward claim', callback };
            const questEntryDetailsMap: any = {
                [QuestVariant.Daily]: { apiKey: 'daily', eventKey: 'daily reward claim', callback },
                [QuestVariant.Twitter]: questEntrySocialDetails,
                [QuestVariant.YouTube]: questEntrySocialDetails,
                [QuestVariant.Discord]: questEntrySocialDetails,
                [QuestVariant.Invite]: { apiKey: 'invite', eventKey: 'invite quest entry', callback },
                [QuestVariant.Web3]: { apiKey: 'web3', eventKey: 'web3 quest entry', callback },
                [QuestVariant.Custom]: {
                    apiKey: 'custom',
                    eventKey: 'milestone reward claim',
                    callback: () => {
                        const index = this.quests.findIndex((q: TQuestCustom) => q._id === quest._id);
                        (this.quests[index] as TQuestCustom).entries.push({
                            questId: quest._id,
                            uuid: '',
                            sub: account.sub,
                            isClaimed: true,
                            amount: (quest as TQuestCustom).amount,
                        });
                    },
                },
                [QuestVariant.Gitcoin]: { apiKey: 'gitcoin', eventKey: 'gitcoin quest entry', callback },
                [QuestVariant.Webhook]: { apiKey: 'webhook', eventKey: 'webhook quest entry', callback },
            };

            // Create entry variant key based on enum key
            const key = QuestVariant[quest.variant].toLowerCase();

            // Create ReCaptcha Token
            const recaptcha = await this.getReCAPTCHAToken(`QUEST_${key.toUpperCase()}_ENTRY_CREATE`);
            if (!recaptcha) throw new Error('Was not able to create recaptcha token.');

            // Create quest entry using SDK
            const { eventKey, apiKey } = questEntryDetailsMap[quest.variant];
            const { error, jobId } = await api.request.post(`/v1/quests/${apiKey}/${quest._id}/entries`, {
                data: { ...payload, recaptcha },
            });
            if (error) throw new Error(error);

            // Wait for the quest entry job to complete
            await waitForJob(jobId);

            // Track event in mixpanel
            track('UserCreates', [account?.sub, eventKey, { poolId }]);

            // Execute callback to update state (TODO Make more generic)
            questEntryDetailsMap[quest.variant].callback();

            // Remove potential lock from other quests
            this.unlock(quest);
        },
        async list(poolId?: string) {
            const { api } = useAccountStore();
            this.isLoading = true;

            const { gitcoin, invite, twitter, discord, youtube, custom, daily, web3, webhook } = await api.quests.list(
                poolId,
            );
            const socialQuestList = [...twitter, ...discord, ...youtube];

            this.quests = [...gitcoin, ...invite, ...socialQuestList, ...custom, ...daily, ...web3, ...webhook];
            this.isLoading = false;
        },
    },
});
