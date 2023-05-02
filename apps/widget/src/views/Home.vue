<template>
    <div>
        <BaseModalCampaignExpired :id="'modalCampaignExpiredRewards'" />
    </div>
    <div class="d-flex justify-content-between">
        <div class="w-100 m-2 align-items-center d-flex">
            <i class="fas fa-filter text-primary me-2"></i>
            <b-dropdown size="sm" variant="primary" class="w-100" no-caret>
                <template #button-content v-if="!activeFilters.length"> No filter </template>
                <template #button-content v-else>
                    <i :class="f.icon" class="me-2" :key="key" v-for="(f, key) of activeFilters"></i>
                </template>
                <b-dropdown-item-btn @click.stop="" class="dropdown-item-filter" :key="key" v-for="(f, key) of filters">
                    <b-form-checkbox v-model="activeFilters" :value="f" class="d-block">
                        <div class="d-inline-flex justify-content-center align-items-center" style="width: 20px">
                            <i :class="f.icon" class="text-opaque me-1" />
                        </div>
                        {{ f.label }}
                    </b-form-checkbox>
                </b-dropdown-item-btn>
            </b-dropdown>
        </div>
        <div class="w-100 m-2 align-items-center d-flex">
            <i class="fas fa-sort text-primary me-2"></i>
            <b-dropdown size="sm" variant="primary" class="w-100" no-caret>
                <template #button-content> {{ selectedSort.label }} </template>
                <b-dropdown-item @click="selectedSort = s" :key="key" v-for="(s, key) of sorts">
                    {{ s.label }}
                </b-dropdown-item>
            </b-dropdown>
        </div>
    </div>
    <div class="flex-grow-1 overflow-auto">
        <component
            v-for="(reward, key) of rewards"
            :key="key"
            :is="rewardComponentMap[reward.variant]"
            :reward="reward"
            class="mb-2"
        />
    </div>
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
import { useWalletStore } from '../stores/Wallet';
import { usePerkStore } from '../stores/Perk';
import { RewardSortVariant, RewardVariant } from '../types/enums/rewards';
import { rewardComponentMap, sortMap } from '../utils/rewards';

export default defineComponent({
    name: 'Home',
    components: {
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
            selectedSort: { label: 'Available', key: RewardSortVariant.Available },
            activeFilters: [],
            sorts: [
                { label: 'Available', key: RewardSortVariant.Available },
                { label: 'Created', key: RewardSortVariant.Created },
                { label: 'Amount', key: RewardSortVariant.Amount },
            ],
            filters: [
                { label: 'Daily', key: RewardVariant.Daily, icon: 'fa fa-calendar' },
                { label: 'Referral', key: RewardVariant.Referral, icon: 'fas fa-comments' },
                { label: 'Conditional', key: RewardVariant.Conditional, icon: 'fas fa-trophy' },
                { label: 'Milestone', key: RewardVariant.Milestone, icon: 'fas fa-flag' },
            ],
        };
    },
    computed: {
        ...mapStores(useAccountStore),
        ...mapStores(useRewardStore),
        ...mapStores(usePerkStore),
        ...mapStores(useWalletStore),
        activeSort() {
            return sortMap[this.selectedSort.key];
        },
        rewards() {
            const { rewards } = useRewardStore();
            return rewards
                .filter((r: TBaseReward) =>
                    this.activeFilters.length
                        ? this.activeFilters.map((f: TRewardFilter) => f.key).includes(r.variant)
                        : true,
                )
                .sort(this.activeSort);
        },
    },
    watch: {
        // This redirects the user to the wallet of there are no rewards and perks
        'accountStore.isRewardsLoaded'(isRewardsLoaded) {
            if (isRewardsLoaded && !this.rewardsStore.rewards.length && !this.perksStore.perks.length) {
                this.$router.push(`/${this.accountStore.poolId}/wallet`);
            }
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
