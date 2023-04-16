<template>
    <div class="flex-grow-1 overflow-auto">
        <b-tabs justified content-class="pt-1">
            <b-tab title="All" active>
                <component
                    v-for="(reward, key) of rewardsStore.rewards"
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
        </b-tabs>
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
import { useWalletStore } from '../stores/Wallet';

export default defineComponent({
    name: 'Home',
    components: {
        BaseCardRewardReferral,
        BaseCardRewardPoints,
        BaseCardRewardMilestone,
        BaseCardRewardDaily,
        BaseCardRewardNFT,
    },
    computed: {
        ...mapStores(useAccountStore),
        ...mapStores(useRewardStore),
        ...mapStores(useWalletStore),
    },
});
</script>
