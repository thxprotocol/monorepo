<template>
    <div class="py-2 text-center" v-if="accountStore.isAuthenticated">
        <div class="text-success h1 m-0">
            <strong>{{ accountStore.balance }}</strong>
        </div>
        <div class="text-white">points</div>
    </div>
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
import { useWalletStore } from '../stores/Wallet';

export default defineComponent({
    name: 'Home',
    components: {
        BaseCardRewardReferral,
        BaseCardRewardPoints,
        BaseCardRewardNFT,
    },
    computed: {
        ...mapStores(useRewardStore),
        ...mapStores(useAccountStore),
        ...mapStores(useWalletStore),
    },
    mounted() {
        this.accountStore.init(this.$route.query).then(async () => {
            await this.rewardsStore.list();
            this.updateLauncher();
        });
    },
    methods: {
        updateLauncher() {
            // Send the amount of unclaimed rewards to the parent window and update the launcher
            const { origin } = this.accountStore.config();
            const amount = this.rewardsStore.rewards.filter((r) => !r.isClaimed).length;

            window.top?.postMessage({ message: 'thx.reward.amount', amount }, origin);
        },
    },
});
</script>
