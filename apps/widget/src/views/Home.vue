<template>
    <div>
        <BaseModalCampaignExpired :id="'modalCampaignExpiredRewards'" />
    </div>
    <b-dropdown small variant="primary" id="dropdown-1" text="Dropdown Button">
        <b-dropdown-item>First Action</b-dropdown-item>
        <b-dropdown-item>Second Action</b-dropdown-item>
        <b-dropdown-item>Third Action</b-dropdown-item>
        <b-dropdown-divider></b-dropdown-divider>
        <b-dropdown-item active>Active action</b-dropdown-item>
        <b-dropdown-item disabled>Disabled action</b-dropdown-item>
    </b-dropdown>
    <hr />
    <div class="flex-grow-1 overflow-auto">
        <component
            v-for="(reward, key) of rewardsStore.all"
            :key="key"
            :is="reward.component"
            :reward="reward"
            class="mb-2"
        />
        <!-- <b-tabs justified content-class="pt-1">
            <b-tab title="All" active>
                <component
                    v-for="(reward, key) of rewardsStore.all"
                    :key="key"
                    :is="reward.component"
                    :reward="reward"
                    class="mb-2"
                />
            </b-tab>
            <b-tab>
                <template #title>
                    <i class="fa fa-calendar"></i>
                </template>
                <BaseCardRewardDaily
                    v-for="(reward, key) of rewardsStore.dailyRewards"
                    :key="key"
                    :reward="reward"
                    class="mb-2"
                />
            </b-tab>
            <b-tab>
                <template #title>
                    <i class="fas fa-comments"></i>
                </template>
                <BaseCardRewardReferral
                    v-for="(reward, key) of rewardsStore.referralRewards"
                    :key="key"
                    :reward="reward"
                    class="mb-2"
                />
            </b-tab>
            <b-tab>
                <template #title>
                    <i class="fas fa-trophy"></i>
                </template>
                <BaseCardRewardPoints
                    v-for="(reward, key) of rewardsStore.conditionalRewards"
                    :key="key"
                    :reward="reward"
                    class="mb-2"
                />
            </b-tab>
            <b-tab>
                <template #title>
                    <i class="fas fa-flag"></i>
                </template>
                <BaseCardRewardMilestone
                    v-for="(reward, key) of rewardsStore.milestoneRewards"
                    :key="key"
                    :reward="reward"
                    class="mb-2"
                />
            </b-tab>
        </b-tabs> -->
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
    data() {
        return { filter: '' };
    },
    computed: {
        ...mapStores(useAccountStore),
        ...mapStores(useRewardStore),
        ...mapStores(usePerkStore),
        ...mapStores(useWalletStore),
    },
    watch: {
        // This redirects the user to the wallet of there are no rewards and perks
        'accountStore.isRewardsLoaded'(n, o) {
            if (!this.rewardsStore.rewards.length && !this.perksStore.perks.length) {
                this.$router.push(`/${this.accountStore.poolId}/wallet`);
            }
        },
    },
});
</script>
