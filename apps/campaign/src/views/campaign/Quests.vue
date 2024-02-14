<template>
    <b-container>
        <b-row>
            <b-col lg="7" xl="6" offset-xl="1">
                <div v-if="questStore.isLoading" class="d-flex justify-content-center py-5">
                    <b-spinner variant="primary" small />
                </div>
                <b-tabs v-else content-class="mt-3" justified>
                    <b-tab active>
                        <template #title>
                            Available
                            <sup v-if="availableQuestCount">
                                <b-badge class="px-1 py-1 text-white" variant="danger">
                                    {{ availableQuestCount }}
                                </b-badge>
                            </sup>
                        </template>
                        <div :class="{ 'd-none': !quest.isAvailable }" :key="key" v-for="(quest, key) of quests">
                            <component
                                v-if="quest"
                                :is="questComponentMap[quest.variant]"
                                :quest="quest"
                                class="mb-2 mx-lg-0 my-lg-3"
                            />
                        </div>
                        <div class="text-center mt-5" v-if="!availableQuestCount">
                            <i class="h1 fas fa-trophy text-accent" />
                            <p class="lead text-accent">Well done!</p>
                            <p class="text-opaque">You have completed all available quests</p>
                        </div>
                    </b-tab>
                    <b-tab title="Completed">
                        <div :class="{ 'd-none': quest.isAvailable }" :key="key" v-for="(quest, key) of quests">
                            <component
                                :is="questComponentMap[quest.variant]"
                                :quest="quest"
                                class="mb-2 mx-lg-0 my-lg-3"
                            />
                        </div>
                    </b-tab>
                </b-tabs>
            </b-col>
            <b-col lg="5" xl="4">
                <BaseQuestLeaderboard class="d-none d-lg-block mb-2 mx-lg-0 mb-lg-3" />
            </b-col>
        </b-row>
    </b-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { useAccountStore } from '../../stores/Account';
import { useWalletStore } from '../../stores/Wallet';
import { useQuestStore } from '../../stores/Quest';
import { useRewardStore } from '../../stores/Reward';
import { RewardSortVariant } from '../../types/enums/rewards';
import { questComponentMap, sortMap } from '../../utils/quests';
import BaseCardQuestInvite from '../../components/card/BaseCardQuestInvite.vue';
import BaseCardQuestSocial from '../../components/card/BaseCardQuestSocial.vue';
import BaseCardQuestCustom from '../../components/card/BaseCardQuestCustom.vue';
import BaseCardQuestDaily from '../../components/card/BaseCardQuestDaily.vue';
import BaseCardQuestWeb3 from '../../components/card/BaseCardQuestWeb3.vue';
import BaseCardQuestGitcoin from '../../components/card/BaseCardQuestGitcoin.vue';

export default defineComponent({
    name: 'Quests',
    components: {
        BaseCardQuestInvite,
        BaseCardQuestSocial,
        BaseCardQuestCustom,
        BaseCardQuestDaily,
        BaseCardQuestWeb3,
        BaseCardQuestGitcoin,
    },
    data() {
        return {
            questComponentMap,
            isLgScreen: window.innerWidth > 1000,
            selectedSort: { label: 'Default', key: RewardSortVariant.Default },
            activeFilters: [],
            entry: null,
        };
    },
    computed: {
        ...mapStores(useAccountStore),
        ...mapStores(useQuestStore),
        ...mapStores(useRewardStore),
        ...mapStores(useWalletStore),
        isSubscribed() {
            const { subscription } = useAccountStore();
            return !!subscription;
        },
        isAlertSubscribeShown() {
            return !this.availableQuestCount;
        },
        availableQuestCount() {
            return this.questStore.quests.filter((q: TBaseQuest) => q.isAvailable).length;
        },
        quests() {
            return this.questStore.quests.sort(sortMap[this.selectedSort.key]);
        },
    },
    watch: {
        'accountStore.isAuthenticated': {
            async handler(isAuthenticated: boolean) {
                if (!isAuthenticated) return;
                if (!this.accountStore.account) {
                    await this.accountStore.getAccount();
                }
                this.questStore.list();
            },
            immediate: true,
        },
        'availableQuestCount': {
            handler(amount: number) {
                // Return if not in iframe
                if (window.top === window.self) return;
                // Send the amount of unclaimed rewards to the parent window and update the launcher
                window.top?.postMessage({ message: 'thx.reward.amount', amount }, this.accountStore.config.origin);
            },
            immediate: true,
        },
    },
});
</script>
