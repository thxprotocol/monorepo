<template>
    <b-card class="bg-splash" style="border-radius: 0">
        <div
            class="d-flex justify-content-start align-items-start p-3 cursor-pointer"
            style="border-radius: 5px; background-color: rgba(0, 0, 0, 0.35); width: 100%; height: 90px"
            @click="accountStore.isModalAccountShown = true"
        >
            <template v-if="accountStore.account">
                <b-avatar size="50" :src="accountStore.account.profileImg" class="gradient-border-xl" />
                <div class="px-3" style="min-width: 200px">
                    <h3 class="text-white mb-0">
                        {{ accountStore.account.username }}
                    </h3>
                    <span class="text-opaque">Earned: </span>
                    <b-link class="text-accent text-hover-underline" @click.stop="onClickRewards">
                        {{ toFiatPrice(rewardsInUSD) }}
                    </b-link>
                </div>
            </template>
            <b-spinner v-else small class="text-opaque" />
        </div>
    </b-card>
    <BaseModalClaimTokens :show="isModalClaimTokensShown" @hidden="isModalClaimTokensShown = false" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { useAccountStore } from '../../stores/Account';
import { useVeStore } from '../../stores/VE';
import { useLiquidityStore } from '../../stores/Liquidity';
import { fromWei } from 'web3-utils';
import { toFiatPrice } from '../../utils/price';

export default defineComponent({
    name: 'BaseCardAccount',
    data() {
        return { toFiatPrice, isModalClaimTokensShown: false };
    },
    computed: {
        ...mapStores(useAccountStore, useVeStore, useLiquidityStore),
        rewardsInUSD() {
            if (!this.veStore.rewards.length) return 0;

            const balRewards = Number(fromWei(this.veStore.rewards[0].amount));
            const bptRewards = Number(fromWei(this.veStore.rewards[1].amount));
            const balPrice = this.liquidityStore.pricing['BAL'];
            const bptPrice = this.liquidityStore.pricing['20USDC-80THX'];

            return balRewards * balPrice + bptRewards * bptPrice;
        },
    },
    methods: {
        onClickRewards() {
            this.isModalClaimTokensShown = true;
        },
    },
});
</script>
<style>
.text-hover-underline:hover {
    text-decoration: underline;
}
</style>
