<template>
    <BaseDropdownMetric
        :label="`Week ${reward.week}`"
        :value="toFiatPrice(reward.total)"
        :metrics="[
            {
                label: 'BAL',
                url: chainInfo.blockExplorer + '/token/' + address.BAL,
                badge: toFiatPrice(liquidityStore.pricing['BAL']),
                data: [
                    { label: 'Amount', value: Number(formatUnits(reward.balInWei, 18)).toFixed(6) },
                    { label: 'Value', value: toFiatPrice(reward.balInUSD) },
                ],
            },
            {
                label: '20USDC-80THX',
                url: chainInfo.blockExplorer + '/token/' + address.BPT,
                badge: toFiatPrice(liquidityStore.pricing['20USDC-80THX']),
                data: [
                    { label: 'Amount', value: Number(formatUnits(reward.bptInWei, 18)).toFixed(6) },
                    { label: 'Value', value: toFiatPrice(reward.bptInUSD) },
                ],
            },
        ]"
    />
</template>

<script lang="ts">
import { mapStores } from 'pinia';
import { defineComponent, PropType } from 'vue';
import { useLiquidityStore } from '../../stores/Liquidity';
import { useWalletStore } from '../../stores/Wallet';
import { formatUnits } from 'ethers/lib/utils';
import { toFiatPrice } from '@thxnetwork/app/utils/price';
import { contractNetworks } from '@thxnetwork/app/config/constants';
import { chainList } from '@thxnetwork/app/utils/chains';

type TMetricReward = {
    week: string;
    balInWei: string;
    bptInWei: string;
    balInUSD: string;
    bptInUSD: string;
    total: string;
};

export default defineComponent({
    name: 'BaseDropdownMetricReward',
    props: {
        reward: { type: Object as PropType<TMetricReward>, required: true },
    },
    data() {
        return {
            toFiatPrice,
            formatUnits,
        };
    },
    computed: {
        ...mapStores(useLiquidityStore, useWalletStore),
        address() {
            return contractNetworks[this.liquidityStore.chainId];
        },
        chainInfo() {
            return chainList[this.liquidityStore.chainId];
        },
    },
});
</script>
