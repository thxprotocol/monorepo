<template>
    <div class="card-prices">
        <b-button
            v-for="item of priceList"
            class="px-4 rounded py-1 ms-2"
            variant="dark"
            target="_blank"
            :href="item.url"
        >
            <span style="color: gray !important" class="text-decoration-none">{{ item.ticker }}</span>
            <sup class="text-success ms-1">
                {{ item.value }}
            </sup>
        </b-button>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { useAccountStore } from '../../stores/Account';
import { useAuthStore } from '../../stores/Auth';
import { useWalletStore } from '../../stores/Wallet';
import { useLiquidityStore } from '../../stores/Liquidity';
import { useVeStore } from '../../stores/VE';
import { roundUpFixed, toFiatPrice } from '@thxnetwork/campaign/utils/price';

export default defineComponent({
    name: 'BaseCardPrices',
    data() {
        return {
            toFiatPrice,
            roundUpFixed,
            tabIndex: 1,
            amountDepositInWei: '0',
            isAlertSigninShown: true,
        };
    },
    computed: {
        ...mapStores(useAccountStore, useAuthStore, useWalletStore, useVeStore, useLiquidityStore),
        priceList() {
            return [
                {
                    url: 'https://www.coingecko.com/en/coins/thx-network',
                    ticker: '$THX',
                    value: toFiatPrice(Number(roundUpFixed(this.liquidityStore.pricing['THX'], 2))),
                },
                {
                    url: 'https://www.coingecko.com/en/coins/usdc',
                    ticker: '$USDC',
                    value: toFiatPrice(Number(roundUpFixed(this.liquidityStore.pricing['USDC'], 2))),
                },
                {
                    url: 'https://www.coingecko.com/en/coins/balancer',
                    ticker: '$BAL',
                    value: toFiatPrice(Number(roundUpFixed(this.liquidityStore.pricing['BAL'], 2))),
                },
            ];
        },
    },
    mounted() {
        this.liquidityStore.listPrices();
    },
});
</script>
