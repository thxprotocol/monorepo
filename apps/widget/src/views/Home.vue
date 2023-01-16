<template>
    <div class="flex-grow-1 overflow-auto">
        <component
            v-for="(reward, key) of rewardsStore.rewards"
            :key="key"
            :is="reward.component"
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
import { useWalletStore } from '../stores/Wallet';

export default defineComponent({
    name: 'Home',
    components: {
        BaseCardRewardReferral,
        BaseCardRewardPoints,
        BaseCardRewardMilestone,
        BaseCardRewardNFT,
    },
    computed: {
        ...mapStores(useAccountStore),
        ...mapStores(useRewardStore),
        ...mapStores(useWalletStore),
    },
});
</script>
