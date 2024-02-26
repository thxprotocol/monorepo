<template>
    <b-container>
        <b-row>
            <b-col lg="10" offset-lg="1">
                <div v-if="rewardStore.isLoading" class="d-flex justify-content-center py-5">
                    <b-spinner variant="primary" small />
                </div>
                <b-row v-else>
                    <b-col lg="4" :key="key" v-for="(reward, key) of rewardStore.rewards">
                        <component :is="reward.component" :reward="reward" class="mb-2" />
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
import BaseCardRewardERC20 from '../../components/card/BaseCardRewardERC20.vue';
import BaseCardRewardERC721 from '../../components/card/BaseCardRewardERC721.vue';
import BaseCardRewardCustom from '../../components/card/BaseCardRewardCustom.vue';
import BaseCardRewardCoupon from '../../components/card/BaseCardRewardCoupon.vue';
import BaseCardRewardDiscordRole from '../../components/card/BaseCardRewardDiscordRole.vue';

export default defineComponent({
    name: 'Rewards',
    components: {
        BaseCardRewardERC20,
        BaseCardRewardERC721,
        BaseCardRewardCustom,
        BaseCardRewardCoupon,
        BaseCardRewardDiscordRole,
    },
    computed: {
        ...mapStores(useRewardStore),
    },
    mounted() {
        this.rewardStore.list();
    },
});
</script>
