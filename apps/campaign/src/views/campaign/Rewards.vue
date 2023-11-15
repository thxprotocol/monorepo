<template>
    <BaseModalCampaignExpired :id="'modalCampaignExpiredPerks'" />
    <b-container class="flex-grow-1 overflow-auto order-lg-1">
        <b-row>
            <b-col lg="10" offset-xl="1">
                <b-row>
                    <b-col lg="4" :key="key" v-for="(perk, key) of perksStore.rewards">
                        <component :is="perk.component" :perk="perk" class="mb-2" />
                    </b-col>
                </b-row>
            </b-col>
        </b-row>
    </b-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { usePerkStore } from '../../stores/Perk';
import { useAccountStore } from '../../stores/Account';
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
        ...mapStores(useAccountStore),
        ...mapStores(usePerkStore),
    },
    created() {
        this.perksStore.list();
    },
});
</script>
