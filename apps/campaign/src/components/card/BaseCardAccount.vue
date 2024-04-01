<template>
    <b-card class="bg-splash" style="border-radius: 0">
        <div
            class="d-flex justify-content-start align-items-center p-3 cursor-pointer"
            style="border-radius: 5px; background-color: rgba(0, 0, 0, 0.35); width: 100%"
        >
            <template v-if="accountStore.account">
                <b-link @click="accountStore.isModalAccountShown = true">
                    <b-avatar size="50" :src="accountStore.account.profileImg" class="gradient-border-xl" />
                </b-link>
                <div class="ps-3 flex-grow-1" style="min-width: 200px">
                    <h3 class="text-white mb-0">
                        {{ accountStore.account.username }}
                    </h3>
                    <div class="d-flex align-items-center justify-content-between">
                        <b-link class="text-decoration-none" @click="onClickRewards">
                            <span class="text-accent text-hover-underline">{{ toFiatPrice(rewardsInUSD) }}</span>
                            <i class="fas fa-download small ms-1 text-white text-opaque"></i>
                        </b-link>
                        <BaseDropdownWallets class="ms-auto" />
                    </div>
                </div>
            </template>
            <b-spinner v-else small class="text-opaque" />
        </div>
    </b-card>
    <BaseModalClaimTokens :show="veStore.isModalClaimTokensShown" @hidden="veStore.isModalClaimTokensShown = false" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { useAccountStore } from '../../stores/Account';
import { useVeStore } from '../../stores/VE';
import { useLiquidityStore } from '../../stores/Liquidity';
import { toFiatPrice } from '../../utils/price';
import { formatUnits } from 'ethers/lib/utils';

export default defineComponent({
    name: 'BaseCardAccount',
    data() {
        return { toFiatPrice };
    },
    computed: {
        ...mapStores(useAccountStore, useVeStore, useLiquidityStore),
        rewardsInUSD() {
            if (!this.veStore.rewards.length) return 0;

            const balRewards = Number(formatUnits(this.veStore.rewards[0].amount, 'ether'));
            const bptRewards = Number(formatUnits(this.veStore.rewards[1].amount, 'ether'));
            const balPrice = this.liquidityStore.pricing['BAL'];
            const bptPrice = this.liquidityStore.pricing['20USDC-80THX'];

            return balRewards * balPrice + bptRewards * bptPrice;
        },
    },
    methods: {
        onClickRewards() {
            this.veStore.isModalClaimTokensShown = true;
        },
    },
});
</script>
<style>
.text-hover-underline:hover {
    text-decoration: underline;
}
</style>
