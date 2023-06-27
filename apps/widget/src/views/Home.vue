<template>
    <BaseModalCampaignExpired :id="'modalCampaignExpiredRewards'" />
    <b-container class="flex-grow-1 overflow-auto order-lg-2">
        <b-row>
            <b-col lg="7" xl="6" offset-xl="1">
                <BaseQuestFilters
                    :filter="activeFilters"
                    :sort="selectedSort"
                    @change-filter="onChangeFilter"
                    @change-sort="onChangeSort"
                />
                <component
                    :key="key"
                    v-for="(reward, key) of rewards"
                    :is="rewardComponentMap[reward.variant]"
                    :reward="reward"
                    class="my-2 mx-lg-0 my-lg-3"
                />
            </b-col>
            <b-col lg="5" xl="4">
                <BaseQuestLeaderboard />
            </b-col>
        </b-row>
    </b-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { useRewardStore } from '../stores/Reward';
import { useAccountStore } from '../stores/Account';
import BaseCardRewardReferral from '../components/BaseCardRewardReferral.vue';
import BaseCardRewardPoints from '../components/BaseCardRewardPoints.vue';
import BaseCardRewardNFT from '../components/BaseCardPerkERC721.vue';
import BaseCardRewardMilestone from '../components/BaseCardRewardMilestone.vue';
import BaseCardRewardDaily from '../components/BaseCardRewardDaily.vue';
import BaseModalCampaignExpired from '../components/BaseModalCampaignExpired.vue';
import BaseQuestFilters from '../components/BaseQuestFilters.vue';
import BaseQuestLeaderboard from '../components/BaseQuestLeaderboard.vue';
import { useWalletStore } from '../stores/Wallet';
import { usePerkStore } from '../stores/Perk';
import { RewardSortVariant } from '../types/enums/rewards';
import { rewardComponentMap, sortMap } from '../utils/rewards';

export default defineComponent({
    name: 'Home',
    components: {
        BaseQuestFilters,
        BaseQuestLeaderboard,
        BaseCardRewardReferral,
        BaseCardRewardPoints,
        BaseCardRewardMilestone,
        BaseCardRewardDaily,
        BaseCardRewardNFT,
        BaseModalCampaignExpired,
    },
    data(): any {
        return {
            rewardComponentMap,
            isLgScreen: window.innerWidth > 1000,
            selectedSort: { label: 'Default', key: RewardSortVariant.Default },
            activeFilters: [],
        };
    },
    computed: {
        ...mapStores(useAccountStore),
        ...mapStores(useRewardStore),
        ...mapStores(usePerkStore),
        ...mapStores(useWalletStore),

        rewards() {
            const { rewards } = useRewardStore();
            return rewards
                .filter((r: TBaseReward) =>
                    this.activeFilters.length
                        ? this.activeFilters.map((f: TRewardFilter) => f.key).includes(r.variant)
                        : true,
                )
                .sort(sortMap[this.selectedSort.key]);
        },
    },
    watch: {
        // This redirects the user to the wallet of there are no rewards and perks
        'accountStore.isRewardsLoaded'(isRewardsLoaded) {
            if (isRewardsLoaded && !this.rewardsStore.rewards.length && !this.perksStore.perks.length) {
                this.$router.push(`/${this.accountStore.poolId}/wallet`);
            }
            const { poolId, getConfig } = this.accountStore;
            window.top?.postMessage({ message: 'thx.widget.ready' }, getConfig(poolId).origin);
        },
    },
    methods: {
        onChangeFilter(filter: any) {
            this.activeFilters = filter;
        },
        onChangeSort(sort: any) {
            this.selectedSort = sort;
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
