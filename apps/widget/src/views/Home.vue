<template>
    <div class="home">
        <div class="py-2 text-center">
            <div class="text-success h1 m-0">
                <strong>{{ accountStore.balance }}</strong>
            </div>
            <div>points</div>
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
import BaseCardRewardToken from '../components/BaseCardRewardToken.vue';
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
        BaseCardRewardToken,
        BaseCardRewardNFT,
    },
    mounted: function () {
        this.rewardsStore.list();
    },
    computed: {
        ...mapStores(useRewardStore),
        ...mapStores(useAccountStore),
    },
    data() {
        return {
            Brands,
            RewardVariant,
            balance: 50,
        };
    },
});
</script>
