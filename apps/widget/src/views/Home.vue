<template>
    <div class="home">
        <div class="py-2 text-center">
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
});
</script>
<style lang="scss">
.overflow-auto {
    background-color: #241956;
    color: white;
}

.navbar.bg-dark {
    background-color: #241956 !important;
    a {
        i {
            font-size: 1.3rem;
            margin-bottom: 0.5rem;
        }
        line-height: 1;
        width: 70px;
        height: 70px;
        align-items: center;
        justify-content: center;
        display: flex;
        background-color: #31236d;
        color: white;
        text-decoration: none;
        border-radius: 8px;
        font-size: 0.9rem;
    }
}

.card {
    background-color: #31236d !important;
}
</style>
