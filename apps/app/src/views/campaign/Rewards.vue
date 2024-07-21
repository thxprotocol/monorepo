<template>
    <b-container>
        <b-row>
            <b-col lg="10" offset-lg="1">
                <div v-if="rewardStore.isLoading" class="d-flex justify-content-center py-5">
                    <b-spinner variant="primary" small />
                </div>
                <b-row v-else>
                    <b-col v-for="(reward, key) of rewardStore.rewards" :key="key" lg="4">
                        <component :is="componentMap[reward.variant]" :reward="reward" class="mb-2" />
                    </b-col>
                </b-row>
            </b-col>
        </b-row>
    </b-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { useRewardStore } from '../../stores/Reward';
import { RewardVariant } from '../../types/enums/rewards';
import BaseCardRewardCoin from '../../components/card/BaseCardRewardCoin.vue';
import BaseCardRewardNFT from '../../components/card/BaseCardRewardNFT.vue';
import BaseCardRewardCustom from '../../components/card/BaseCardRewardCustom.vue';
import BaseCardRewardCoupon from '../../components/card/BaseCardRewardCoupon.vue';
import BaseCardRewardDiscordRole from '../../components/card/BaseCardRewardDiscordRole.vue';

const componentMap: { [variant: string]: string } = {
    [RewardVariant.Coin]: 'BaseCardRewardCoin',
    [RewardVariant.NFT]: 'BaseCardRewardNFT',
    [RewardVariant.Custom]: 'BaseCardRewardCustom',
    [RewardVariant.Coupon]: 'BaseCardRewardCoupon',
    [RewardVariant.DiscordRole]: 'BaseCardRewardDiscordRole',
};

export default defineComponent({
    name: 'Rewards',
    components: {
        BaseCardRewardCoin,
        BaseCardRewardNFT,
        BaseCardRewardCustom,
        BaseCardRewardCoupon,
        BaseCardRewardDiscordRole,
    },
    data() {
        return {
            componentMap,
        };
    },
    computed: {
        ...mapStores(useRewardStore),
    },
    mounted() {
        this.rewardStore.list();
    },
});
</script>
