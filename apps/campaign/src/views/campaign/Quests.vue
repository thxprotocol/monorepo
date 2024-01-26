<template>
    <b-container>
        <b-row>
            <b-col lg="7" xl="6" offset-xl="1">
                <b-tabs content-class="mt-3" justified>
                    <b-tab active>
                        <template #title>
                            Available
                            <sup v-if="availableQuestCount">
                                <b-badge class="px-1 py-1 text-white" variant="danger">
                                    {{ availableQuestCount }}
                                </b-badge>
                            </sup>
                        </template>
                        <div :class="{ 'd-none': quest.isHidden }" :key="key" v-for="(quest, key) of quests">
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
                        <div :class="{ 'd-none': !quest.isHidden }" :key="key" v-for="(quest, key) of quests">
                            <component
                                :is="questComponentMap[quest.variant]"
                                :quest="quest"
                                @unlock="onClickUnlock"
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
import { filterAvailableMap, questComponentMap, sortMap } from '../../utils/quests';
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
    data(): any {
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
            const { quests } = useQuestStore();
            return quests.filter((q: TBaseQuest) => filterAvailableMap[q.variant](q)).length;
        },
        quests() {
            const { quests } = useQuestStore();
            return quests
                .map((q: TBaseQuest) => ({ ...q, isHidden: !filterAvailableMap[q.variant](q) }))
                .filter((q: TBaseQuest) =>
                    this.activeFilters.length
                        ? this.activeFilters.map((f: TQuestFilter) => f.key).includes(q.variant)
                        : true,
                )
                .sort(sortMap[this.selectedSort.key]);
        },
    },
    watch: {
        'accountStore.isAuthenticated': {
            handler(isAuthenticated: boolean) {
                if (!isAuthenticated) return;
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
<style lang="scss">
.dropdown-item-filter {
    .form-check {
        padding: 0.15rem 0;
        padding-right: 1.5rem;
        &:hover {
            background-color: var(--bs-dropdown-link-hover-bg) !important;
        }
    }
    .form-check-input {
        float: right;
        margin-right: -1.25rem;
    }
    label {
        display: block;
        cursor: pointer;
        padding: 0 0.5rem;
    }
}
</style>
