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
                    class="mb-2 mx-lg-0 my-lg-3"
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
import { useRewardStore } from '../../stores/Reward';
import { useAccountStore } from '../../stores/Account';
import BaseCardQuestInvite from '../../components/BaseCardQuestInvite.vue';
import BaseCardQuestSocial from '../../components/BaseCardQuestSocial.vue';
import BaseCardQuestCustom from '../../components/BaseCardQuestCustom.vue';
import BaseCardQuestDaily from '../../components/BaseCardQuestDaily.vue';
import BaseCardQuestWeb3 from '../../components/BaseCardQuestWeb3.vue';
import BaseModalCampaignExpired from '../../components/BaseModalCampaignExpired.vue';
import BaseQuestFilters from '../../components/BaseQuestFilters.vue';
import BaseQuestLeaderboard from '../../components/BaseQuestLeaderboard.vue';
import { useWalletStore } from '../../stores/Wallet';
import { usePerkStore } from '../../stores/Perk';
import { RewardSortVariant } from '../../types/enums/rewards';
import { rewardComponentMap, sortMap } from '../../utils/quests';

export default defineComponent({
    name: 'Quests',
    components: {
        BaseQuestFilters,
        BaseQuestLeaderboard,
        BaseCardQuestInvite,
        BaseCardQuestSocial,
        BaseCardQuestCustom,
        BaseCardQuestDaily,
        BaseCardQuestWeb3,
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
                .filter((r: TBaseQuest) =>
                    this.activeFilters.length
                        ? this.activeFilters.map((f: TQuestFilter) => f.key).includes(r.variant)
                        : true,
                )
                .sort(sortMap[this.selectedSort.key]);
        },
    },
    watch: {
        // This redirects the user to the wallet of there are no rewards and perks
        'accountStore.isRewardsLoaded': {
            handler(isRewardsLoaded) {
                if (isRewardsLoaded && !this.rewardsStore.rewards.length && !this.perksStore.perks.length) {
                    this.$router.push(`/c/${this.accountStore.poolId}/wallet`);
                }
            },
            deep: true,
            immediate: true,
        },
    },
    methods: {
        onChangeFilter(filter: any) {
            const filterArr = Object.values(this.activeFilters);
            const filterIndex = filterArr.findIndex((f: any) => f.key == filter.key);
            this.activeFilters = filterIndex > -1 ? filterArr.splice(filterIndex, -1) : [...filterArr, filter];
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
