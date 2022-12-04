<template>
    <div class="home">
        <div class="py-2 text-center" v-if="accountStore.isAuthenticated">
            <div class="text-success h1 m-0">
                <strong>{{ accountStore.balance }}</strong>
            </div>
            <div class="text-white">points</div>
        </div>
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
import BaseCardRewardReferral from '../components/BaseCardRewardReferral.vue';
import BaseCardRewardPoints from '../components/BaseCardRewardPoints.vue';
import BaseCardRewardNFT from '../components/BaseCardRewardNFT.vue';
import { mapStores } from 'pinia';
import { useRewardStore } from '../stores/Reward';
import { useAccountStore } from '../stores/Account';
import { RewardVariant } from '../utils/rewards';
import { Brands } from '../utils/social';

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
    },
    data() {
        return {
            Brands,
            RewardVariant,
        };
    },
    created: function () {
        this.accountStore.init(this.$route.query).then(() => {
            this.accountStore.getBalance();
            this.rewardsStore.list();
        });
    },
});
</script>
